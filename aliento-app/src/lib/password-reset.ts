import { randomBytes } from "node:crypto";

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export function createPasswordResetToken() {
  return randomBytes(32).toString("hex");
}

export function passwordResetExpiry() {
  return new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString();
}

export function isPasswordResetTokenValid(expiresAt?: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}
