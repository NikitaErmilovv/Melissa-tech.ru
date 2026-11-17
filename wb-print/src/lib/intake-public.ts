import {
  intakeBatchProgress,
  intakeMaxPerRequest,
  intakeRemainingSlots,
  intakeUsesBatches,
  INTAKE_BATCH_SIZE,
} from "./intake-batch";
import type { Order } from "./types";

export interface PublicIntakeFile {
  id: string;
  name: string;
  contentType: string;
}

export interface PublicIntakeView {
  wbOrderId: string;
  articleTitle: string;
  need: number;
  got: number;
  /** Сколько ещё можно дописать в заказ (не больше need − got). */
  remaining: number;
  /** Сколько можно в одной отправке (≤ 25 для крупных заказов). */
  maxPerSend: number;
  batchMode: boolean;
  batchSize: number;
  batchIndex: number;
  batchCount: number;
  complete: boolean;
  cancelled: boolean;
  kind: Order["kind"];
  stickerSquare: boolean;
  files: PublicIntakeFile[];
}

export function publicIntakeView(order: Order): PublicIntakeView {
  const need = order.expectedPhotos;
  const got = order.files.length;
  const complete = need > 0 && got >= need;
  const batchMode = intakeUsesBatches(need);
  const { batchIndex, batchCount } = intakeBatchProgress(order);
  return {
    wbOrderId: order.wbOrderId || "—",
    articleTitle: order.articleTitle,
    need,
    got,
    remaining: intakeRemainingSlots(order),
    maxPerSend: intakeMaxPerRequest(order),
    batchMode,
    batchSize: INTAKE_BATCH_SIZE,
    batchIndex,
    batchCount: batchMode ? batchCount : 1,
    complete,
    cancelled: order.printStatus === "cancelled" || order.printStatus === "defect",
    kind: order.kind,
    stickerSquare: order.kind === "sticker",
    files: order.files.map((file) => ({
      id: file.id,
      name: file.name,
      contentType: file.contentType,
    })),
  };
}