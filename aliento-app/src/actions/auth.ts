"use server";

import { redirect } from "next/navigation";
import { redirectWithQuery } from "@/lib/redirect-with";
import { prisma, hashPassword, verifyPassword } from "@/lib/db";
import { createSession, destroySession, getCurrentUser } from "@/lib/session";
import { isAdmin, isStaff, type Role } from "@/lib/format";
import { sendVerificationEmail, sendPasswordResetEmail, isSmtpConfigured } from "@/lib/email";
import {
  createPasswordResetToken,
  isPasswordResetTokenValid,
  passwordResetExpiry,
} from "@/lib/password-reset";
import {
  createEmailVerificationCode,
  emailVerificationExpiry,
  isVerificationTokenValid,
  normalizeVerificationCode,
} from "@/lib/email-verification";
import { isValidDateOfBirth, normalizeDateOfBirth } from "@/lib/birthdays";
import { isValidRuPhone, normalizePhone } from "@/lib/phone";

function emailOf(formData: FormData) {
  return String(formData.get("email") || "")
    .trim()
    .toLowerCase();
}

async function issueVerification(user: { id: string; name: string; email: string }) {
  const code = createEmailVerificationCode();
  const emailVerificationExpiresAt = emailVerificationExpiry();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: code,
      emailVerificationExpiresAt,
      emailVerified: false,
    },
  });

  return sendVerificationEmail(user.email, user.name, code);
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const dateOfBirthRaw = String(formData.get("dateOfBirth") || "").trim();
  const email = emailOf(formData);
  const phoneRaw = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  const dateOfBirth = normalizeDateOfBirth(dateOfBirthRaw);
  const phone = normalizePhone(phoneRaw);

  if (!name || !dateOfBirth || !email || !phoneRaw || password.length < 6) {
    redirectWithQuery("/register", {
      error: "Заполните все поля. Пароль — от 6 символов.",
    });
  }

  if (!isValidDateOfBirth(dateOfBirth)) {
    redirectWithQuery("/register", {
      error: "Укажите корректную дату рождения (ДД.ММ.ГГГГ).",
    });
  }

  if (!isValidRuPhone(phoneRaw)) {
    redirectWithQuery("/register", { error: "Укажите корректный номер телефона." });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) redirectWithQuery("/register", { error: "Этот email уже зарегистрирован." });

  const userData = {
    name,
    dateOfBirth,
    email,
    phone,
    passwordHash: hashPassword(password),
    role: "STUDENT",
    isDemo: false,
    emailVerified: false,
  };

  const user = await prisma.user.create({ data: userData });

  try {
    await issueVerification(user);
  } catch (error) {
    console.error("[register] email send failed:", error);
    redirectWithQuery("/register", {
      error: "Не удалось отправить письмо. Проверьте email или попробуйте позже.",
    });
  }

  redirectWithQuery("/register/check-email", { email });
}

export async function loginAction(formData: FormData) {
  const email = emailOf(formData);
  const password = String(formData.get("password") || "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.blocked) {
    redirectWithQuery("/login", { error: "Неверный email или пароль." });
  }
  const ok = verifyPassword(password, user.passwordHash);
  if (!ok) redirectWithQuery("/login", { error: "Неверный email или пароль." });

  if (user.role === "STUDENT" && !user.emailVerified) {
    redirectWithQuery("/register/check-email", {
      email,
      error: "Подтвердите email — введите код из письма.",
    });
  }

  await createSession(user.id);
  if (isStaff(user.role as Role)) redirect("/admin");
  redirect("/cabinet");
}

export async function verifyEmailCodeAction(formData: FormData) {
  const email = emailOf(formData);
  const code = normalizeVerificationCode(String(formData.get("code") || ""));

  if (!email || code.length !== 6) {
    redirectWithQuery("/register/check-email", {
      email,
      error: "Введите email и 6-значный код из письма.",
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirectWithQuery("/register/check-email", {
      email,
      error: "Неверный код или email.",
    });
  }

  if (user.emailVerified) {
    await createSession(user.id);
    redirect("/cabinet?verified=1");
  }

  if (user.emailVerificationToken !== code) {
    redirectWithQuery("/register/check-email", {
      email,
      error: "Неверный код. Проверьте письмо или запросите новый.",
    });
  }

  if (!isVerificationTokenValid(user.emailVerificationExpiresAt)) {
    redirectWithQuery("/register/check-email", {
      email,
      error: "Код истёк. Запросите новое письмо.",
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpiresAt: undefined,
    },
  });

  await createSession(user.id);
  redirect("/cabinet?verified=1");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = emailOf(formData);
  if (!email) redirectWithQuery("/forgot-password", { error: "Укажите email." });

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.role === "STUDENT") {
    const token = createPasswordResetToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpiresAt: passwordResetExpiry(),
      },
    });
    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (error) {
      console.error("[password-reset] email send failed:", error);
      redirectWithQuery("/forgot-password", {
        error: "Не удалось отправить письмо. Попробуйте позже.",
      });
    }
  }

  redirectWithQuery("/forgot-password", { sent: "1", email });
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!token) redirectWithQuery("/login", { error: "Некорректная ссылка сброса пароля." });
  if (password.length < 6) {
    redirectWithQuery("/reset-password", {
      token,
      error: "Пароль должен быть не короче 6 символов.",
    });
  }
  if (password !== confirm) {
    redirectWithQuery("/reset-password", { token, error: "Пароли не совпадают." });
  }

  const user = await prisma.user.findByPasswordResetToken(token);
  if (!user) redirectWithQuery("/login", { error: "Ссылка недействительна или уже использована." });
  if (!isPasswordResetTokenValid(user.passwordResetExpiresAt)) {
    redirectWithQuery("/forgot-password", {
      error: "Ссылка истекла. Запросите новое письмо.",
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashPassword(password),
      passwordResetToken: undefined,
      passwordResetExpiresAt: undefined,
    },
  });

  await createSession(user.id);
  redirectWithQuery("/cabinet", { message: "Пароль обновлён. Вы вошли в кабинет." });
}

export async function resendVerificationAction(formData: FormData) {
  const email = emailOf(formData);
  if (!email) redirectWithQuery("/register/check-email", { error: "Укажите email." });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirectWithQuery("/register/check-email", { email, sent: "1" });
  }

  if (user.emailVerified) {
    redirectWithQuery("/login", { message: "Email уже подтверждён. Можно войти." });
  }

  try {
    await issueVerification(user);
  } catch (error) {
    console.error("[resend] email send failed:", error);
    redirectWithQuery("/register/check-email", {
      email,
      error: "Не удалось отправить письмо. Попробуйте позже.",
    });
  }

  redirectWithQuery("/register/check-email", { email, sent: "1" });
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "STUDENT" && !user.emailVerified) {
    redirect(`/register/check-email?email=${encodeURIComponent(user.email)}`);
  }
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (!isStaff(user.role)) redirect("/cabinet");
  return user;
}

export async function requireStudent() {
  const user = await requireUser();
  if (isStaff(user.role)) redirect("/admin");
  if (!user.emailVerified) {
    redirect(`/register/check-email?email=${encodeURIComponent(user.email)}`);
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user.role)) redirect("/admin");
  return user;
}

export async function getSmtpStatus() {
  return { configured: isSmtpConfigured() };
}
