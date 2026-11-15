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
  return {
    wbOrderId: order.wbOrderId || "—",
    articleTitle: order.articleTitle,
    need,
    got,
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