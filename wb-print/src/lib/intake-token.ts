import crypto from "crypto";
import { readDb } from "./db";
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

export function orderByIntakeToken(token: string): Order | undefined {
  const key = decodeURIComponent(token).trim();
  if (!key) return undefined;
  return readDb().orders.find((order) => order.intakeToken === key);
}

export interface PublicIntakeView {
  wbOrderId: string;
  articleTitle: string;
  need: number;
  got: number;
  complete: boolean;
  cancelled: boolean;
  kind: Order["kind"];
  stickerSquare: boolean;
}

export function publicIntakeView(order: Order): PublicIntakeView {
  const need = order.expectedPhotos;
  const got = order.files.length;
  const complete = need > 0 && got >= need;
  return {
    wbOrderId: order.wbOrderId || "—",
    articleTitle: order.articleTitle,
    need,
    got,
    complete,
    cancelled: order.printStatus === "cancelled" || order.printStatus === "defect",
    kind: order.kind,
    stickerSquare: order.kind === "sticker",
  };
}