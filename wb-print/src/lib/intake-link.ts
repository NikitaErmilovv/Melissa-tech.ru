import crypto from "crypto";
import type { Order } from "./types";

export function publicBaseUrl(): string {
  const fromEnv = process.env.PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "https://wb-print.tw1.ru";
}

export function ensureIntakeToken(order: Order): string {
  if (order.intakeToken?.trim()) return order.intakeToken.trim();
  const token = crypto.randomBytes(18).toString("base64url");
  order.intakeToken = token;
  return token;
}

export function intakeLink(order: Order): string {
  const token = order.intakeToken?.trim() || "";
  if (!token) return `${publicBaseUrl()}/upload`;
  return `${publicBaseUrl()}/upload/${encodeURIComponent(token)}`;
}