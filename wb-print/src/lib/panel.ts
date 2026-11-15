import fs from "fs";
import { folderRelFor, pushLog, withDb } from "./db";
import { savePreparedFile } from "./images";
import { safeAbs, uid } from "./paths";
import { countPhrase, DEFAULT_TEMPLATES } from "./text";
import type { PrintStatus, ProductKind, TemplateKey, Templates } from "./types";

const PRINT: PrintStatus[] = ["new", "printing", "done", "defect", "cancelled"];
const PRINT_LABEL: Record<PrintStatus, string> = {
  new: "новый",
  printing: "в печати",
  done: "готово",
  defect: "брак",
  cancelled: "отменён",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export async function updateOrder(
  id: string,
  patch: {
    printStatus?: PrintStatus;
    expectedPhotos?: number;
    wbOrderId?: string;
    diskUrl?: string;
    articleId?: string;
  },
) {
  await withDb((db) => {
    const order = db.orders.find((item) => item.id === id);
    if (!order) throw new Error("заказ не найден");
    if (patch.printStatus && PRINT.includes(patch.printStatus) && patch.printStatus !== order.printStatus) {
      order.printStatus = patch.printStatus;
      if (patch.printStatus === "done") {
        order.archivedAt = new Date().toISOString();
        pushLog(order, "system", "Заказ отмечен готовым и убран в архив на столе.");
      } else if (order.archivedAt) {
        order.archivedAt = null;
        pushLog(order, "system", "Заказ снова на активном столе.");
      }
      pushLog(order, "system", `Статус печати: ${PRINT_LABEL[patch.printStatus]}.`);
    }
    if (patch.articleId) {
      const article = db.articles.find((item) => item.id === patch.articleId);
      if (!article) throw new Error("артикул не найден");
      order.vendorCode = article.vendorCode;
      order.articleTitle = article.title;
      order.nmId = article.nmId;
      order.kind = article.kind;
      order.expectedPhotos = article.photoCount;
      if (order.files.length === 0) {
        order.folderRel = folderRelFor(order.createdAt, order.wbOrderId, article.photoCount, article.vendorCode, article.kind);
      }
      pushLog(order, "system", `Артикул: ${article.title}, ждём ${countPhrase(article.photoCount, article.kind)}.`);
    } else if (typeof patch.expectedPhotos === "number" && Number.isFinite(patch.expectedPhotos)) {
      order.expectedPhotos = clamp(patch.expectedPhotos, 0, 500);
    }
    if (patch.wbOrderId?.trim()) order.wbOrderId = patch.wbOrderId.trim();
    if (typeof patch.diskUrl === "string") order.diskUrl = patch.diskUrl.trim();
    order.updatedAt = new Date().toISOString();
  });
}

export async function removeOrder(id: string) {
  await withDb((db) => {
    const order = db.orders.find((item) => item.id === id);
    if (!order) throw new Error("заказ не найден");
    const abs = safeAbs(order.folderRel);
    if (abs) fs.rmSync(abs, { recursive: true, force: true });
    db.orders = db.orders.filter((item) => item.id !== id);
  });
}

export async function addUploads(orderId: string, files: Buffer[]) {
  let saved = 0;
  let skipped = 0;
  let squared = 0;
  await withDb(async (db) => {
    const order = db.orders.find((item) => item.id === orderId);
    if (!order) throw new Error("заказ не найден");
    for (const bytes of files) {
      const result = await savePreparedFile(order, bytes, "manual");
      if ("error" in result.saved) skipped += 1;
      else {
        saved += 1;
        if (result.cropped) squared += 1;
      }
    }
    if (saved && order.intakeMode === "choice") order.intakeMode = "photos";
    pushLog(
      order,
      "system",
      `С компьютера добавлено фото: ${saved}${skipped ? `, пропущено ${skipped}` : ""}${squared ? `. В квадрат с левого верхнего угла: ${squared}` : ""}.`,
    );
  });
  return { saved, skipped };
}

export async function saveArticle(input: {
  id?: string;
  vendorCode: string;
  nmId: number | null;
  title: string;
  photoCount: number;
  note: string;
  kind?: ProductKind;
}) {
  const vendorCode = input.vendorCode.trim();
  const title = input.title.trim();
  if (!vendorCode || !title) throw new Error("нужны артикул и название");
  const photoCount = clamp(input.photoCount, 1, 500);
  const kind: ProductKind = input.kind === "photo" ? "photo" : "sticker";
  await withDb((db) => {
    const duplicate = db.articles.find(
      (article) => article.vendorCode.toLowerCase() === vendorCode.toLowerCase() && article.id !== input.id,
    );
    if (duplicate) throw new Error("такой артикул уже есть");
    if (input.id) {
      const article = db.articles.find((item) => item.id === input.id);
      if (!article) throw new Error("артикул не найден");
      article.vendorCode = vendorCode;
      article.nmId = input.nmId;
      article.title = title;
      article.photoCount = photoCount;
      article.note = input.note.trim();
      article.kind = kind;
      return;
    }
    db.articles.push({
      id: uid("art"),
      vendorCode,
      nmId: input.nmId,
      title,
      photoCount,
      note: input.note.trim(),
      kind,
    });
  });
}

export async function removeArticle(id: string) {
  await withDb((db) => {
    db.articles = db.articles.filter((article) => article.id !== id);
  });
}

export async function saveTemplates(patch: Partial<Templates>) {
  await withDb((db) => {
    for (const key of Object.keys(DEFAULT_TEMPLATES) as TemplateKey[]) {
      const value = patch[key];
      if (typeof value === "string" && value.trim()) db.templates[key] = value.trim();
    }
  });
}

export async function saveSettings(patch: {
  token?: string;
  clearToken?: boolean;
  silenceMin?: number;
  remindMin?: number;
  liveReplies?: boolean;
}) {
  await withDb((db) => {
    if (patch.clearToken) {
      db.settings.token = "";
      db.settings.liveReplies = false;
      db.settings.eventNext = null;
      db.settings.eventCaughtUp = false;
      db.settings.eventSeenUntil = 0;
      db.settings.watchFrom = 0;
      db.settings.chatSigns = {};
      db.fbsOrders = [];
    } else if (typeof patch.token === "string" && patch.token.trim()) {
      const next = patch.token.trim();
      if (next !== db.settings.token) {
        const now = Date.now();
        db.settings.token = next;
        db.settings.eventNext = now;
        db.settings.eventCaughtUp = true;
        db.settings.eventSeenUntil = now;
        db.settings.watchFrom = now;
        db.settings.seenEventIds = [];
        db.settings.chatSigns = {};
        db.settings.lastChatSyncAt = null;
        db.settings.liveReplies = false;
        db.fbsOrders = [];
      }
    }
    if (typeof patch.silenceMin === "number" && Number.isFinite(patch.silenceMin)) {
      db.settings.silenceMin = clamp(patch.silenceMin, 5, 30);
    }
    if (typeof patch.remindMin === "number" && Number.isFinite(patch.remindMin)) {
      db.settings.remindMin = clamp(patch.remindMin, 20, 120);
    }
    if (typeof patch.liveReplies === "boolean") {
      db.settings.liveReplies = patch.liveReplies;
      if (patch.liveReplies && !db.settings.watchFrom) {
        const now = Date.now();
        db.settings.watchFrom = now;
        db.settings.eventNext = now;
        db.settings.eventSeenUntil = now;
        db.settings.eventCaughtUp = true;
      }
    }
  });
}

export async function cleanupOld() {
  const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
  let removed = 0;
  await withDb((db) => {
    const keep = [];
    for (const order of db.orders) {
      const terminal = order.printStatus === "done" || order.printStatus === "cancelled" || order.printStatus === "defect";
      const old = new Date(order.createdAt).getTime() < cutoff;
      if (terminal && old) {
        const abs = safeAbs(order.folderRel);
        if (abs) fs.rmSync(abs, { recursive: true, force: true });
        removed += 1;
      } else {
        keep.push(order);
      }
    }
    db.orders = keep;
  });
  return removed;
}
