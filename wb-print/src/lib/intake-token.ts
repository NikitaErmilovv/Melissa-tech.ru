import { readDb } from "./db";
import type { Order } from "./types";

export type { PublicIntakeView } from "./intake-public";
export { publicIntakeView } from "./intake-public";

export function orderByIntakeToken(token: string): Order | undefined {
  const key = decodeURIComponent(token).trim();
  if (!key) return undefined;
  return readDb().orders.find((order) => order.intakeToken === key);
}