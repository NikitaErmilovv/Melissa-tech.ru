import { randomInt } from "node:crypto";

const CODE_TTL_MS = 24 * 60 * 60 * 1000;

export function createEmailVerificationCode() {
  return String(randomInt(100000, 1000000));
}

/** @deprecated use createEmailVerificationCode */
export function createEmailVerificationToken() {
  return createEmailVerificationCode();
}

export function emailVerificationExpiry() {
  return new Date(Date.now() + CODE_TTL_MS).toISOString();
}

export function isVerificationTokenValid(expiresAt?: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}

export function normalizeVerificationCode(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 6);
}
