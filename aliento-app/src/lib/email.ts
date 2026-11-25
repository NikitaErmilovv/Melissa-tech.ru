import nodemailer from "nodemailer";
import { renderEmailHtml, renderEmailText, renderVerificationCodeEmailHtml, renderVerificationCodeEmailText } from "@/lib/email-layout";
import {
  createEmailVerificationCode,
  emailVerificationExpiry,
} from "@/lib/email-verification";
import {
  createPasswordResetToken,
  passwordResetExpiry,
} from "@/lib/password-reset";

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== "false" && port === 465;

  return {
    host,
    port,
    secure,
    auth: { user, pass },
  };
}

export function isSmtpConfigured() {
  return smtpConfig() !== null;
}

function fromAddress() {
  return process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || "noreply@aliento.dance";
}

function fromName() {
  return process.env.EMAIL_FROM_NAME?.trim() || "Aliento";
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

async function deliverMail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
  logLabel: string;
  logDetail: string;
}) {
  const config = smtpConfig();
  if (!config) {
    console.info(`[email] SMTP не настроен. ${options.logLabel}:`, options.logDetail);
    return { sent: false, detail: options.logDetail };
  }

  const transport = nodemailer.createTransport({
    ...config,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  await transport.sendMail({
    from: `"${fromName()}" <${fromAddress()}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  return { sent: true, detail: options.logDetail };
}

export async function sendVerificationEmail(to: string, name: string, code: string) {
  const subject = "Добро пожаловать в Aliento — код подтверждения";
  const firstName = name.trim().split(/\s+/)[1] || name.trim().split(/\s+/)[0] || name;
  const enterUrl = `${siteUrl()}/register/check-email?email=${encodeURIComponent(to)}`;

  const html = renderVerificationCodeEmailHtml({
    preview: `Код подтверждения: ${code}`,
    title: subject,
    greeting: `Здравствуйте, ${firstName}!`,
    body: [
      "Рады видеть вас в школе бачаты Aliento.",
      "Введите код на сайте, чтобы подтвердить email и войти в личный кабинет.",
    ],
    code,
    footerNote: "Код действует 24 часа. Если вы не регистрировались — просто проигнорируйте письмо.",
  });

  const text = renderVerificationCodeEmailText({
    greeting: `Здравствуйте, ${firstName}!`,
    body: [
      "Спасибо за регистрацию в школе бачаты Aliento.",
      `Введите код на странице подтверждения: ${enterUrl}`,
    ],
    code,
    footerNote: "Код действует 24 часа.",
  });

  return deliverMail({
    to,
    subject,
    text,
    html,
    logLabel: "Код подтверждения",
    logDetail: code,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${siteUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = "Сброс пароля — Aliento";
  const firstName = name.trim().split(/\s+/)[1] || name.trim().split(/\s+/)[0] || name;

  const html = renderEmailHtml({
    preview: "Запрос на смену пароля в Aliento.",
    title: subject,
    greeting: `Здравствуйте, ${firstName}!`,
    body: [
      "Мы получили запрос на смену пароля для вашего аккаунта в Aliento.",
      "Нажмите кнопку ниже, чтобы задать новый пароль. Если это были не вы — просто проигнорируйте письмо, пароль не изменится.",
    ],
    buttonLabel: "Сменить пароль",
    buttonUrl: resetUrl,
    footerNote: "Ссылка действует 1 час.",
  });

  const text = renderEmailText({
    title: subject,
    greeting: `Здравствуйте, ${firstName}!`,
    body: [
      "Запрос на смену пароля для аккаунта Aliento.",
      "Перейдите по ссылке, чтобы задать новый пароль.",
    ],
    buttonLabel: "Сменить пароль",
    buttonUrl: resetUrl,
    linkLabel: "Ссылка",
    footerNote: "Ссылка действует 1 час.",
  });

  return deliverMail({
    to,
    subject,
    text,
    html,
    logLabel: "Ссылка сброса пароля",
    logDetail: resetUrl,
  });
}

export {
  createEmailVerificationCode,
  emailVerificationExpiry,
  createPasswordResetToken,
  passwordResetExpiry,
};
