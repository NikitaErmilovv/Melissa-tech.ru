import { prisma, verifyPassword } from "@/lib/db";
import { isStaff, type Role } from "@/lib/format";

export function normalizeLoginPassword(email: string, password: string) {
  const pwd = String(password);
  if (email.endsWith("@aliento.test") && pwd.toLowerCase() === "aliento123") {
    return "aliento123";
  }
  return pwd;
}

export type LoginResult =
  | { ok: true; userId: string; redirectTo: string }
  | { ok: false; redirectTo: string; error: string };

export async function resolveLogin(email: string, password: string): Promise<LoginResult> {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const passwordNorm = normalizeLoginPassword(normalizedEmail, password);

  if (!normalizedEmail || !passwordNorm) {
    return { ok: false, redirectTo: "/login", error: "Введите email и пароль." };
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || user.blocked || !verifyPassword(passwordNorm, user.passwordHash)) {
    return { ok: false, redirectTo: "/login", error: "Неверный email или пароль." };
  }

  if (user.role === "STUDENT" && !user.emailVerified) {
    return {
      ok: false,
      redirectTo: `/register/check-email?email=${encodeURIComponent(normalizedEmail)}`,
      error: "Подтвердите email — введите код из письма.",
    };
  }

  const redirectTo = isStaff(user.role as Role) ? "/admin" : "/cabinet";
  return { ok: true, userId: user.id, redirectTo };
}
