import crypto from "crypto";
import type { Order } from "./types";

export function publicBaseUrl(): string {
  const fromEnv = process.env.PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "https://wb-print.tw1.ru";
}

export function intakeOrderSlug(order: Order): string {
  const wb = order.wbOrderId?.trim();
  if (wb && wb !== "без-номера" && /^\d+$/.test(wb)) return wb;
  return order.id.replace(/^ord_/, "z");
}

export function ensureIntakeToken(order: Order): string {
  if (order.intakeToken?.trim()) return order.intakeToken.trim();
  const token = crypto.randomBytes(8).toString("base64url");
  order.intakeToken = token;
  return token;
}

export function intakePath(order: Order): { slug: string; key: string } {
  return { slug: intakeOrderSlug(order), key: ensureIntakeToken(order) };
}

export function intakeLink(order: Order): string {
  const { slug, key } = intakePath(order);
  return `${publicBaseUrl()}/upload/${encodeURIComponent(slug)}/${encodeURIComponent(key)}`;
}