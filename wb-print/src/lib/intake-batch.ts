import type { Order } from "./types";

/** Заказы от 26 фото — только порциями. */
export const INTAKE_BATCH_MIN_NEED = 26;
export const INTAKE_BATCH_SIZE = 25;

export function intakeRemainingSlots(order: Pick<Order, "expectedPhotos" | "files">): number {
  const need = order.expectedPhotos;
  if (need <= 0) return 0;
  return Math.max(0, need - order.files.length);
}

/** Сколько файлов можно принять одним POST — жёсткий потолок для больших заказов. */
export function intakeMaxPerRequest(order: Pick<Order, "expectedPhotos" | "files">): number {
  const left = intakeRemainingSlots(order);
  if (left <= 0) return 0;
  if (order.expectedPhotos < INTAKE_BATCH_MIN_NEED) return left;
  return Math.min(INTAKE_BATCH_SIZE, left);
}

export function intakeUsesBatches(need: number): boolean {
  return need >= INTAKE_BATCH_MIN_NEED;
}

export function intakeBatchCount(need: number): number {
  if (!intakeUsesBatches(need)) return 1;
  return Math.ceil(need / INTAKE_BATCH_SIZE);
}

/** Текущая порция (1-based) и сколько в ней уже есть. */
export function intakeBatchProgress(order: Pick<Order, "expectedPhotos" | "files">) {
  const need = order.expectedPhotos;
  const got = order.files.length;
  if (!intakeUsesBatches(need)) {
    return { batchIndex: 1, batchCount: 1, inCurrentBatch: got, batchFull: got >= need };
  }
  const batchCount = intakeBatchCount(need);
  const batchIndex = Math.min(batchCount, Math.floor(got / INTAKE_BATCH_SIZE) + 1);
  const inCurrentBatch = got % INTAKE_BATCH_SIZE;
  const batchFull = inCurrentBatch === 0 && got > 0 && got < need;
  return { batchIndex, batchCount, inCurrentBatch, batchFull };
}

export function validateIntakeBatchUpload(
  order: Pick<Order, "expectedPhotos" | "files" | "printStatus">,
  incomingCount: number,
): string | null {
  if (order.printStatus === "cancelled" || order.printStatus === "defect") {
    return "заказ отменён, файлы больше не принимаем";
  }
  if (incomingCount < 1) return "выберите хотя бы одно фото";
  const slots = intakeRemainingSlots(order);
  if (slots <= 0) return "в заказе уже достаточно фото";
  if (incomingCount > slots) {
    return `в заказе осталось места на ${slots} фото, вы отправили ${incomingCount}`;
  }
  const max = intakeMaxPerRequest(order);
  if (incomingCount > max) {
    if (intakeUsesBatches(order.expectedPhotos)) {
      return `за один раз — не больше ${INTAKE_BATCH_SIZE} фото (уже сохранено ${order.files.length} из ${order.expectedPhotos})`;
    }
    return `за раз можно не больше ${max} фото`;
  }
  return null;
}