import fs from "fs";
import { folderRelFor, pushLog, readDb, seenEvent, withDb } from "./db";
import { pullPublicDisk } from "./disks";
import { savePreparedFile } from "./images";
import { safeAbs, uid } from "./paths";
import {
  buyerIntent,
  diskUrlFromText,
  fill,
  orderVars,
  parseArticleCode,
  parseOrderDigits,
  parsePhotoCount,
  REPLACE_MS,
  wantsReplace,
} from "./text";
import type { Article, Database, FileSource, Order } from "./types";
import { sendChatMessage } from "./wb";

export interface IngestImage {
  bytes: Buffer;
  source: FileSource;
}

export interface IngestInput {
  eventId?: string;
  chatId?: string;
  replySign?: string;
  clientName?: string;
  text?: string;
  nmId?: number | null;
  rid?: string;
  vendorCode?: string;
  wbOrderId?: string;
  orderUid?: string;
  articleId?: string;
  images?: IngestImage[];
  source: "wb" | "demo";
  orderId?: string;
}

function findArticle(
  db: Database,
  opts: { articleId?: string; nmId?: number | null; vendorCode?: string },
): Article | undefined {
  if (opts.articleId) {
    const byId = db.articles.find((article) => article.id === opts.articleId);
    if (byId) return byId;
  }
  if (opts.nmId) {
    const byNm = db.articles.find((article) => article.nmId === opts.nmId);
    if (byNm) return byNm;
  }
  const code = opts.vendorCode?.trim().toLowerCase();
  if (code) return db.articles.find((article) => article.vendorCode.toLowerCase() === code);
  return undefined;
}

function clearOrderFiles(order: Order) {
  for (const file of order.files) {
    const abs = safeAbs(file.relPath);
    if (!abs) continue;
    try {
      fs.unlinkSync(abs);
    } catch {
      // файла уже нет
    }
  }
  order.files = [];
  order.lastPhotoAt = null;
  pushLog(order, "system", "Прежние фотографии убраны: покупатель написал «замена».");
}

function assignArticle(order: Order, article: Article) {
  order.vendorCode = article.vendorCode;
  order.articleTitle = article.title;
  order.nmId = article.nmId;
  order.kind = article.kind;
  order.expectedPhotos = article.photoCount;
  if (order.files.length === 0) {
    order.folderRel = folderRelFor(order.createdAt, order.wbOrderId, article.photoCount, article.vendorCode, article.kind);
  }
}

function matchFbs(db: Database, rid: string, digits: string | null) {
  if (rid) {
    const byRid = db.fbsOrders.find((order) => order.rid && order.rid === rid);
    if (byRid) return byRid;
  }
  if (digits) {
    const byId = db.fbsOrders.find((order) => String(order.id) === digits);
    if (byId) return byId;
  }
  return undefined;
}

function nextNumber(db: Database): string {
  for (let i = 0; i < 20; i++) {
    const value = String(39000000 + Math.floor(Math.random() * 899999));
    if (!db.orders.some((order) => order.wbOrderId === value)) return value;
  }
  return String(Date.now()).slice(-8);
}

function freshOrder(db: Database, input: IngestInput, text: string): Order {
  const digits = input.wbOrderId?.trim() || parseOrderDigits(text);
  const vendorFromText = input.vendorCode || parseArticleCode(text) || "";
  const fbs = input.source === "wb" ? matchFbs(db, input.rid || "", digits) : undefined;
  const article = findArticle(db, {
    articleId: input.articleId,
    nmId: input.nmId ?? fbs?.nmId ?? null,
    vendorCode: vendorFromText || fbs?.article || "",
  });
  const wbOrderId = fbs ? String(fbs.id) : digits || (input.source === "demo" ? nextNumber(db) : "");
  const createdAt = new Date().toISOString();
  const expected = article?.photoCount ?? 0;
  const vendor = article?.vendorCode || fbs?.article || vendorFromText || "";
  const kind = article?.kind ?? "photo";
  const wbId = wbOrderId || "без-номера";
  return {
    id: uid("ord"),
    wbOrderId: wbId,
    orderUid: input.orderUid || fbs?.orderUid || "",
    rid: input.rid || fbs?.rid || "",
    nmId: article?.nmId ?? input.nmId ?? fbs?.nmId ?? null,
    vendorCode: vendor,
    articleTitle: article?.title || (vendor ? `Артикул ${vendor}` : "Артикул не задан"),
    kind,
    expectedPhotos: expected,
    clientName: input.clientName || "",
    chatId: input.chatId || "",
    replySign: input.replySign || "",
    folderRel: folderRelFor(createdAt, wbId, expected, vendor, kind),
    createdAt,
    updatedAt: createdAt,
    printStatus: "new",
    intakeMode: "choice",
    greetedAt: null,
    replacing: false,
    replaceHintAt: null,
    diskUrl: "",
    diskNote: "",
    lastPhotoAt: null,
    lastReminderAt: null,
    completedNoticeAt: null,
    archivedAt: null,
    source: input.source,
    files: [],
    log: [],
    pendingDownloads: [],
  };
}

export async function deliver(orderId: string, text: string) {
  const snap = readDb();
  const order = snap.orders.find((item) => item.id === orderId);
  if (!order) return;
  const token = snap.settings.token.trim();
  const sign = (order.chatId && snap.settings.chatSigns[order.chatId]?.replySign) || order.replySign;
  let delivered = false;
  let error = "";
  if (token && sign && order.source === "wb") {
    try {
      await sendChatMessage(token, sign, text);
      delivered = true;
    } catch (err) {
      error = err instanceof Error ? err.message : "не отправилось";
    }
  }
  await withDb((db) => {
    const current = db.orders.find((item) => item.id === orderId);
    if (!current) return;
    if (sign) current.replySign = sign;
    pushLog(current, "out", text, delivered);
    if (error) pushLog(current, "system", `В чат не ушло: ${error}`);
  });
}

export async function ingest(input: IngestInput): Promise<{ orderId: string; replies: string[] }> {
  const text = (input.text ?? "").trim();
  const images = input.images ?? [];

  const prepared = await withDb(async (db) => {
    if (seenEvent(db, input.eventId)) {
      const existing = db.orders.find((order) => input.chatId && order.chatId === input.chatId);
      return { orderId: existing?.id ?? "", replies: [] as string[], fetchUrl: "" };
    }

    let order = input.orderId ? db.orders.find((item) => item.id === input.orderId) : undefined;
    if (input.orderId && !order) throw new Error("заказ не найден");
    if (!order && input.chatId) order = db.orders.find((item) => item.chatId === input.chatId);
    if (!order && input.rid) order = db.orders.find((item) => item.rid && item.rid === input.rid);
    const digits = input.wbOrderId?.trim() || parseOrderDigits(text);
    if (!order && digits) order = db.orders.find((item) => item.wbOrderId === digits);

    const created = !order;
    if (!order) {
      order = freshOrder(db, input, text);
      db.orders.unshift(order);
      pushLog(order, "system", "Папка заказа создана.");
    }

    if (input.chatId) order.chatId = input.chatId;
    if (input.replySign) order.replySign = input.replySign;
    if (input.clientName && !order.clientName) order.clientName = input.clientName;
    if (input.rid && !order.rid) order.rid = input.rid;
    if (!order.nmId && input.nmId) order.nmId = input.nmId;
    if (order.chatId && db.settings.chatSigns[order.chatId]?.replySign) {
      order.replySign = db.settings.chatSigns[order.chatId].replySign;
    }
    if (order.expectedPhotos === 0 || created) {
      const article = findArticle(db, {
        articleId: input.articleId,
        nmId: order.nmId,
        vendorCode: order.vendorCode || input.vendorCode || parseArticleCode(text) || "",
      });
      if (article && (created || order.expectedPhotos === 0)) assignArticle(order, article);
    }
    if ((!order.wbOrderId || order.wbOrderId === "без-номера") && digits) order.wbOrderId = digits;

    const sticker = order.kind === "sticker";
    const rawUrl = diskUrlFromText(text);
    const now = Date.now();
    const wasFull =
      order.expectedPhotos > 0 &&
      order.files.length >= order.expectedPhotos &&
      Boolean(order.completedNoticeAt) &&
      !order.replacing;
    const inWindow = Boolean(order.completedNoticeAt) && now - new Date(order.completedNoticeAt!).getTime() <= REPLACE_MS;
    let openedReplace = false;
    if (wasFull && wantsReplace(text) && inWindow) {
      clearOrderFiles(order);
      order.completedNoticeAt = null;
      order.replacing = true;
      order.replaceHintAt = null;
      order.intakeMode = "photos";
      order.lastPhotoAt = new Date().toISOString();
      openedReplace = true;
    }
    const accepting = !order.completedNoticeAt || order.replacing || order.files.length < order.expectedPhotos;

    const gotBefore = order.files.length;
    let saved = 0;
    let rejected = 0;
    let squared = 0;
    let squareFailed = 0;
    if (accepting) {
      for (const image of images) {
        const result = await savePreparedFile(order, image.bytes, image.source);
        if ("error" in result.saved) rejected += 1;
        else {
          saved += 1;
          if (result.cropped) squared += 1;
        }
        if (result.failed) squareFailed += 1;
      }
      if (rejected) pushLog(order, "system", `Пропущено файлов: ${rejected}. Сохраняю только фотографии.`);
      if (squared) pushLog(order, "system", `Неквадратные фото обрезал в квадрат с левого верхнего угла: ${squared}.`);
      if (squareFailed) pushLog(order, "system", `Квадрат не получился, в папке исходный файл: ${squareFailed}.`);
    }

    const typedCount = order.expectedPhotos === 0 ? parsePhotoCount(text) : null;
    if (typedCount && accepting) {
      order.expectedPhotos = typedCount;
      pushLog(order, "system", `Число фото взято из сообщения покупателя: ${typedCount}.`);
    }

    let fetchUrl = "";
    const url = sticker || !accepting ? "" : rawUrl;
    if (url && url !== order.diskUrl) {
      order.diskUrl = url;
      order.intakeMode = "link";
      order.diskNote = "Ссылка записана, скачиваю…";
      fetchUrl = url;
    }

    const intent = buyerIntent(text);
    if (saved > 0) order.intakeMode = "photos";
    else if (!sticker && intent === "photos") order.intakeMode = "photos";
    else if (!sticker && intent === "link") order.intakeMode = "link";

    const line = [text, images.length ? `вложений: ${images.length}` : ""].filter(Boolean).join(" · ");
    if (line) pushLog(order, "in", line);

    const replies: string[] = [];
    const stopped = order.printStatus === "cancelled" || order.printStatus === "defect";
    if (!stopped) {
      const got = order.files.length;
      const need = order.expectedPhotos;
      const justDone = need > 0 && gotBefore < need && got >= need && !order.completedNoticeAt;
      if (!accepting) {
        const ask = images.length > 0 || Boolean(rawUrl) || wantsReplace(text);
        if (ask && !inWindow && order.replaceHintAt !== "closed") {
          replies.push(fill(db.templates.replaceClosed, orderVars(order)));
          order.replaceHintAt = "closed";
        } else if (ask && inWindow && !order.replaceHintAt) {
          replies.push(fill(db.templates.replaceLocked, orderVars(order)));
          order.replaceHintAt = new Date().toISOString();
        }
      } else if (!order.greetedAt) {
        if (need === 0) replies.push(fill(db.templates.unknownArticle, orderVars(order)));
        else if (justDone) replies.push(fill(db.templates.complete, orderVars(order)));
        else if (sticker && saved === 0) {
          replies.push(fill(db.templates.greetingSticker, orderVars(order)));
          if (rawUrl) replies.push(fill(db.templates.stickerNoLink, orderVars(order)));
        } else if (saved > 0) replies.push(fill(db.templates.progress, orderVars(order)));
        else if (!sticker && url) replies.push(fill(db.templates.diskSaved, orderVars(order)));
        else if (!sticker && intent === "photos") replies.push(fill(db.templates.askPhotos, orderVars(order)));
        else if (!sticker && intent === "link") replies.push(fill(db.templates.askLink, orderVars(order)));
        else replies.push(fill(sticker ? db.templates.greetingSticker : db.templates.greeting, orderVars(order)));
        order.greetedAt = new Date().toISOString();
      } else if (justDone) {
        replies.push(fill(db.templates.complete, orderVars(order)));
      } else if (openedReplace && saved === 0 && !fetchUrl) {
        replies.push(fill(db.templates.replaceAsk, orderVars(order)));
      } else if (saved > 0 && gotBefore === 0) {
        replies.push(fill(db.templates.progress, orderVars(order)));
      } else if (sticker && rawUrl) {
        replies.push(fill(db.templates.stickerNoLink, orderVars(order)));
      } else if (!sticker && url) {
        replies.push(fill(db.templates.diskSaved, orderVars(order)));
      } else if (!sticker && intent === "photos" && saved === 0) {
        replies.push(fill(db.templates.askPhotos, orderVars(order)));
      } else if (!sticker && intent === "link" && !url) {
        replies.push(fill(db.templates.askLink, orderVars(order)));
      }
      if (justDone) {
        order.completedNoticeAt = new Date().toISOString();
        order.replacing = false;
        order.replaceHintAt = null;
      }
    }

    return { orderId: order.id, replies, fetchUrl };
  });

  if (!prepared.orderId) return { orderId: "", replies: [] };

  if (prepared.fetchUrl) {
    const pulled = await pullPublicDisk(prepared.fetchUrl);
    let completeText = "";
    await withDb(async (db) => {
      const order = db.orders.find((item) => item.id === prepared.orderId);
      if (!order) return;
      const before = order.files.length;
      let skipped = 0;
      let squared = 0;
      for (const file of pulled.files) {
        const saved = await savePreparedFile(order, file.bytes, file.source);
        if ("error" in saved.saved) skipped += 1;
        else if (saved.cropped) squared += 1;
      }
      if (squared) pushLog(order, "system", `Неквадратные фото обрезал в квадрат с левого верхнего угла: ${squared}.`);
      order.diskNote = pulled.note;
      const added = order.files.length - before;
      if (added) order.diskNote += ` В папку легло ${added} фото.`;
      if (skipped) order.diskNote += ` Пропущено ${skipped}.`;
      order.intakeMode = "link";
      pushLog(order, "system", order.diskNote);
      const need = order.expectedPhotos;
      if (
        need > 0 &&
        before < need &&
        order.files.length >= need &&
        !order.completedNoticeAt &&
        order.printStatus !== "cancelled" &&
        order.printStatus !== "defect"
      ) {
        order.completedNoticeAt = new Date().toISOString();
        order.replacing = false;
        order.replaceHintAt = null;
        completeText = fill(db.templates.complete, orderVars(order));
      } else if (added > 0 && before === 0 && need > order.files.length) {
        completeText = fill(db.templates.progress, orderVars(order));
      }
    });
    if (completeText) prepared.replies.push(completeText);
  }

  for (const reply of prepared.replies) await deliver(prepared.orderId, reply);
  return { orderId: prepared.orderId, replies: prepared.replies };
}

export async function attachBytes(orderId: string, bytes: Buffer, source: FileSource) {
  let completeText = "";
  await withDb(async (db) => {
    const order = db.orders.find((item) => item.id === orderId);
    if (!order) return;
    const accepting = !order.completedNoticeAt || order.replacing || order.files.length < order.expectedPhotos;
    if (!accepting) {
      pushLog(order, "system", "Новое фото из чата не сохранил: набор уже принят, слова «замена» не было.");
      return;
    }
    const before = order.files.length;
    const prepared = await savePreparedFile(order, bytes, source);
    if ("error" in prepared.saved) {
      pushLog(order, "system", "Файл из чата не сохранён: это не фотография.");
      return;
    }
    if (prepared.cropped) pushLog(order, "system", "Неквадратное фото обрезал в квадрат с левого верхнего угла.");
    if (prepared.failed) pushLog(order, "system", "Квадрат не получился, в папке исходный файл.");
    const need = order.expectedPhotos;
    if (
      need > 0 &&
      before < need &&
      order.files.length >= need &&
      !order.completedNoticeAt &&
      order.printStatus !== "cancelled" &&
      order.printStatus !== "defect"
    ) {
      order.completedNoticeAt = new Date().toISOString();
      order.replacing = false;
      order.replaceHintAt = null;
      completeText = fill(db.templates.complete, orderVars(order));
    }
  });
  if (completeText) await deliver(orderId, completeText);
}

export async function downloadIntoOrder(orderId: string, url?: string) {
  const snap = readDb().orders.find((order) => order.id === orderId);
  if (!snap) throw new Error("заказ не найден");
  if (snap.kind === "sticker") throw new Error("для стикеров ссылку не принимаю");
  const target = (url ?? snap.diskUrl).trim();
  if (!target) throw new Error("нет ссылки");
  if (target !== snap.diskUrl) {
    await withDb((db) => {
      const order = db.orders.find((item) => item.id === orderId);
      if (!order) return;
      order.diskUrl = target;
      order.intakeMode = "link";
    });
  }
  const pulled = await pullPublicDisk(target);
  let added = 0;
  await withDb(async (db) => {
    const order = db.orders.find((item) => item.id === orderId);
    if (!order) return;
    const before = order.files.length;
    let skipped = 0;
    for (const file of pulled.files) {
      const saved = await savePreparedFile(order, file.bytes, file.source);
      if ("error" in saved.saved) skipped += 1;
    }
    added = order.files.length - before;
    order.diskNote = pulled.note;
    if (added) order.diskNote += ` В папку легло ${added} фото.`;
    if (skipped) order.diskNote += ` Пропущено ${skipped}.`;
    pushLog(order, "system", order.diskNote);
  });
  return { added, note: pulled.note };
}

export async function forceRemind(orderId: string) {
  const snap = readDb();
  const order = snap.orders.find((item) => item.id === orderId);
  if (!order) throw new Error("заказ не найден");
  if (order.printStatus === "cancelled" || order.printStatus === "defect") {
    throw new Error("по отменённому заказу не напоминаем");
  }
  const full = order.expectedPhotos > 0 && order.files.length >= order.expectedPhotos;
  const locked = Boolean(order.completedNoticeAt) && !order.replacing && full;
  const inWindow = locked && Date.now() - new Date(order.completedNoticeAt!).getTime() <= REPLACE_MS;
  const text = locked
    ? fill(inWindow ? snap.templates.replaceLocked : snap.templates.replaceClosed, orderVars(order))
    : full
      ? fill(snap.templates.complete, orderVars(order))
      : order.intakeMode === "link" && !order.diskUrl
        ? fill(snap.templates.askLink, orderVars(order))
        : order.expectedPhotos > 0
          ? fill(snap.templates.reminder, orderVars(order))
          : fill(snap.templates.unknownArticle, orderVars(order));
  await withDb((db) => {
    const current = db.orders.find((item) => item.id === orderId);
    if (current) current.lastReminderAt = new Date().toISOString();
  });
  await deliver(orderId, text);
  return { text };
}
