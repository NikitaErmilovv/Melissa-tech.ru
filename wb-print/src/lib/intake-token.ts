import { intakeOrderSlug } from "./intake-link";
import { readDb } from "./db";
import type { Order } from "./types";

export type { PublicIntakeView } from "./intake-public";
export { publicIntakeView } from "./intake-public";

/** Старые ссылки с одним сегментом (только секрет). */
export function orderByIntakeToken(token: string): Order | undefined {
  const key = decodeURIComponent(token).trim();
  if (!key) return undefined;
  return readDb().orders.find((order) => order.intakeToken === key);
}

export function orderByIntakeRoute(slug: string, key: string): Order | undefined {
  const wb = decodeURIComponent(slug).trim();
  const secret = decodeURIComponent(key).trim();
  if (!wb || !secret) return undefined;
  const orders = readDb().orders.filter((order) => order.intakeToken === secret);
  if (orders.length === 1) return orders[0];
  return orders.find((order) => order.wbOrderId === wb || intakeOrderSlug(order) === wb);
}