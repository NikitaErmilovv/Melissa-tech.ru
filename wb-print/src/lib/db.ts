import fs from "fs";
import path from "path";
import { saveOrderFile } from "./images";
import { dataRoot, ensureDir } from "./paths";
import { demoPhoto } from "./png";
import { templatesWithDefaults } from "./text";
import { dayKey } from "./time";
import type { Article, Database, Order, OrderLog, ProductKind, Settings } from "./types";

const dbFile = () => path.join(dataRoot(), "db.json");

let chain: Promise<unknown> = Promise.resolve();

export function folderRelFor(createdAt: string, wbOrderId: string, count: number, vendor: string, kind: ProductKind = "photo"): string {
  const safe = (value: string) =>
    value.replace(/[^\wа-яА-ЯёЁ.-]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "zakaz";
  const countLabel = count > 0 ? (kind === "sticker" ? `${count}шт` : `${count}фото`) : kind === "sticker" ? "стикеры" : "фото";
  const root = kind === "sticker" ? "stickers" : "photos";
  return path.posix.join("files", root, dayKey(createdAt), `${safe(wbOrderId)}_${countLabel}_${safe(vendor || "artikul")}`);
}

export function pushLog(order: Order, kind: OrderLog["kind"], text: string, delivered?: boolean) {
  const at = new Date().toISOString();
  order.log.push({ at, kind, text: text.slice(0, 1000), delivered });
  if (order.log.length > 80) order.log.splice(0, order.log.length - 80);
  order.updatedAt = at;
}

function emptySettings(): Settings {
  return {
    token: "",
    silenceMin: 2,
    remindMin: 4,
    eventNext: null,
    eventCaughtUp: false,
    eventSeenUntil: 0,
    watchFrom: 0,
    lastStatusSyncAt: null,
    lastChatSyncAt: null,
    chatSigns: {},
    seenEventIds: [],
    liveReplies: false,
  };
}

export const STICKER_ARTICLES: Article[] = [
  { id: "art_wb_258503365", vendorCode: "Парные на заказ 2 шт.", nmId: 258503365, title: "3D-стикеры, парные, 2 шт.", photoCount: 2, note: "3D-стикеры на заказ", kind: "sticker" },
  { id: "art_wb_262097340", vendorCode: "на заказ 4 шт", nmId: 262097340, title: "3D-стикеры на заказ, 4 шт.", photoCount: 4, note: "3D-стикеры на заказ", kind: "sticker" },
  { id: "art_wb_276923672", vendorCode: "на заказ 1 шт.", nmId: 276923672, title: "3D-стикеры на заказ, 1 шт.", photoCount: 1, note: "3D-стикеры на заказ", kind: "sticker" },
  { id: "art_wb_276938669", vendorCode: "на заказ 6 шт.", nmId: 276938669, title: "3D-стикеры на заказ, 6 шт.", photoCount: 6, note: "3D-стикеры на заказ", kind: "sticker" },
  { id: "art_wb_276940430", vendorCode: "на заказ 8 шт.", nmId: 276940430, title: "3D-стикеры на заказ, 8 шт.", photoCount: 8, note: "3D-стикеры на заказ", kind: "sticker" },
  { id: "art_wb_276957436", vendorCode: "на заказ 12 шт.", nmId: 276957436, title: "3D-стикеры на заказ, 12 шт.", photoCount: 12, note: "3D-стикеры на заказ", kind: "sticker" },
];

/** Печать 15×10 и Polaroid — nmId и число фото из карточек WB. */
export const PHOTO_ARTICLES: Article[] = [
  { id: "art_wb_2092236615", vendorCode: "Photo25", nmId: 2092236615, title: "Печать фотографий 15×10, 25 шт.", photoCount: 25, note: "Печать фотографий", kind: "photo" },
  { id: "art_wb_2091707052", vendorCode: "Photo200", nmId: 2091707052, title: "Печать фотографий 15×10, 200 шт.", photoCount: 200, note: "Печать фотографий", kind: "photo" },
  { id: "art_wb_2091707050", vendorCode: "Polaroid200", nmId: 2091707050, title: "Polaroid 15×10, 200 шт.", photoCount: 200, note: "Печать в стиле Polaroid", kind: "photo" },
  { id: "art_wb_239587807", vendorCode: "Polaroid50", nmId: 239587807, title: "Polaroid 15×10, 50 шт.", photoCount: 50, note: "Печать в стиле Polaroid", kind: "photo" },
  { id: "art_wb_188970290", vendorCode: "Polaroid100", nmId: 188970290, title: "Polaroid 15×10, 100 шт.", photoCount: 100, note: "Печать в стиле Polaroid", kind: "photo" },
  { id: "art_wb_2091707053", vendorCode: "Photo50", nmId: 2091707053, title: "Печать фотографий 15×10, 50 шт.", photoCount: 50, note: "Печать фотографий", kind: "photo" },
  { id: "art_wb_2091707051", vendorCode: "Photo100", nmId: 2091707051, title: "Печать фотографий 15×10, 100 шт.", photoCount: 100, note: "Печать фотографий", kind: "photo" },
  { id: "art_wb_203546851", vendorCode: "Polaroid25", nmId: 203546851, title: "Polaroid 15×10, 25 шт.", photoCount: 25, note: "Печать в стиле Polaroid", kind: "photo" },
];

const BUILTIN_ARTICLES: Article[] = [...STICKER_ARTICLES, ...PHOTO_ARTICLES];

function defaultArticles(): Article[] {
  return BUILTIN_ARTICLES.map((article) => ({ ...article }));
}

function entry(at: string, kind: OrderLog["kind"], text: string): OrderLog {
  return { at, kind, text, delivered: false };
}

function blankOrder(fields: Pick<Order, "id" | "wbOrderId" | "vendorCode" | "articleTitle" | "expectedPhotos" | "clientName" | "chatId" | "createdAt" | "printStatus" | "intakeMode"> & Partial<Order>): Order {
  const createdAt = fields.createdAt;
  const kind = fields.kind ?? "photo";
  return {
    orderUid: "",
    rid: "",
    nmId: null,
    replySign: "",
    kind,
    folderRel: folderRelFor(createdAt, fields.wbOrderId, fields.expectedPhotos, fields.vendorCode, kind),
    updatedAt: createdAt,
    greetedAt: null,
    replacing: false,
    replaceHintAt: null,
    diskUrl: "",
    diskNote: "",
    lastPhotoAt: null,
    lastReminderAt: null,
    completedNoticeAt: null,
    archivedAt: null,
    source: "demo",
    files: [],
    log: [],
    pendingDownloads: [],
    ...fields,
  };
}

function fillDemo(order: Order, count: number, start: number) {
  for (let i = 0; i < count; i++) saveOrderFile(order, demoPhoto(start + i), "demo");
}

function seed(): Database {
  const now = Date.now();
  const iso = (shiftMs: number) => new Date(now - shiftMs).toISOString();
  const articles = defaultArticles();
  const pair = articles[0];
  const stick4 = articles[1];
  const stick12 = articles[5];

  const partial = blankOrder({
    id: "ord_demo_partial",
    wbOrderId: "39218411",
    nmId: pair.nmId,
    vendorCode: pair.vendorCode,
    articleTitle: pair.title,
    kind: "sticker",
    expectedPhotos: pair.photoCount,
    clientName: "Мария",
    chatId: "demo:maria",
    createdAt: iso(40 * 60_000),
    printStatus: "new",
    intakeMode: "photos",
    greetedAt: iso(36 * 60_000),
  });
  fillDemo(partial, 1, 1);
  partial.lastPhotoAt = iso(5 * 60_000);
  partial.updatedAt = partial.lastPhotoAt;
  partial.log = [
    entry(iso(38 * 60_000), "in", "Здравствуйте, вот первые фото по заказу"),
    entry(iso(36 * 60_000), "out", "Заказ №39218411. Принял 1 из 2. Ещё не хватает 1 стикер — дошлите следующим сообщением."),
  ];

  const ready = blankOrder({
    id: "ord_demo_ready",
    wbOrderId: "39218466",
    nmId: stick4.nmId,
    vendorCode: stick4.vendorCode,
    articleTitle: stick4.title,
    kind: "sticker",
    expectedPhotos: stick4.photoCount,
    clientName: "Игорь",
    chatId: "demo:igor",
    createdAt: iso(3 * 3600_000),
    printStatus: "printing",
    intakeMode: "photos",
    greetedAt: iso(3 * 3600_000 - 60_000),
    completedNoticeAt: iso(2 * 3600_000),
  });
  fillDemo(ready, 4, 21);
  ready.log = [
    entry(iso(3 * 3600_000), "in", "Фото стикеров, все четыре"),
    entry(iso(2 * 3600_000), "out", "Все 4 фото по заказу №39218466 на месте. Передаём в печать."),
    entry(iso(90 * 60_000), "system", "Статус печати: в печати"),
  ];

  const waiting = blankOrder({
    id: "ord_demo_choice",
    wbOrderId: "39219002",
    nmId: stick12.nmId,
    vendorCode: stick12.vendorCode,
    articleTitle: stick12.title,
    kind: "sticker",
    expectedPhotos: stick12.photoCount,
    clientName: "Алина",
    chatId: "demo:alina",
    createdAt: iso(25 * 60_000),
    printStatus: "new",
    intakeMode: "choice",
    greetedAt: iso(24 * 60_000),
  });
  waiting.log = [
    entry(iso(25 * 60_000), "in", "Здравствуйте, я по заказу стикеров"),
    entry(iso(24 * 60_000), "out", "Здравствуйте! Заказ Wildberries №39219002 — «3D-стикеры на заказ, 12 шт.». Нужно 12 стикеров."),
  ];

  const linked = blankOrder({
    id: "ord_demo_link",
    wbOrderId: "39219120",
    nmId: articles[3].nmId,
    vendorCode: articles[3].vendorCode,
    articleTitle: articles[3].title,
    kind: "sticker",
    expectedPhotos: articles[3].photoCount,
    clientName: "Павел",
    chatId: "demo:pavel",
    createdAt: iso(80 * 60_000),
    printStatus: "new",
    intakeMode: "link",
    greetedAt: iso(78 * 60_000),
    diskUrl: "https://disk.yandex.ru/d/primer-otkrytyj",
    diskNote: "Пример ссылки. Диск не существует — кнопка «Скачать в эту папку» покажет, что доступ не открылся.",
  });
  linked.log = [
    entry(iso(80 * 60_000), "in", "Ссылка: https://disk.yandex.ru/d/primer-otkrytyj"),
    entry(iso(78 * 60_000), "out", "Заказ №39219120. Ссылку записал."),
  ];

  const cancelled = blankOrder({
    id: "ord_demo_cancel",
    wbOrderId: "39217004",
    nmId: articles[4].nmId,
    vendorCode: articles[4].vendorCode,
    articleTitle: articles[4].title,
    kind: "sticker",
    expectedPhotos: articles[4].photoCount,
    clientName: "Ольга",
    chatId: "demo:olga",
    createdAt: iso(26 * 3600_000),
    printStatus: "cancelled",
    intakeMode: "photos",
    greetedAt: iso(26 * 3600_000),
  });
  fillDemo(cancelled, 8, 41);
  cancelled.lastPhotoAt = iso(25 * 3600_000);
  cancelled.log = [
    entry(iso(26 * 3600_000), "in", "Начинаю слать фото"),
    entry(iso(25 * 3600_000), "system", "На Wildberries заказ отменён. Папка помечена, напоминания остановлены. Покупателю ничего не пишем."),
  ];

  const db: Database = {
    version: 1,
    articles,
    orders: [partial, ready, waiting, linked, cancelled],
    templates: templatesWithDefaults(null),
    settings: emptySettings(),
    fbsOrders: [],
    fbsFetchedAt: null,
  };
  return db;
}

function normalize(db: Database): Database {
  db.articles ??= [];
  db.orders ??= [];
  db.fbsOrders ??= [];
  db.templates = templatesWithDefaults(db.templates);
  const exampleIds = new Set(["art_album_50", "art_album_100", "art_stick_2", "art_stick_4", "art_stick_6", "art_stick_12"]);
  db.articles = db.articles.filter((article) => !exampleIds.has(article.id));
  for (const article of BUILTIN_ARTICLES) {
    const index = db.articles.findIndex((item) => item.nmId === article.nmId || item.id === article.id);
    if (index >= 0) db.articles[index] = { ...db.articles[index], ...article };
    else db.articles.push({ ...article });
  }
  for (const article of db.articles) article.kind = article.kind === "sticker" ? "sticker" : "photo";
  db.settings = { ...emptySettings(), ...db.settings };
  db.settings.liveReplies = Boolean(db.settings.liveReplies);
  db.settings.eventCaughtUp = Boolean(db.settings.eventCaughtUp);
  db.settings.eventSeenUntil = Number(db.settings.eventSeenUntil) || 0;
  db.settings.watchFrom = Number(db.settings.watchFrom) || 0;
  db.settings.chatSigns ??= {};
  db.settings.seenEventIds ??= [];
  for (const order of db.orders) {
    order.files ??= [];
    order.log ??= [];
    order.pendingDownloads ??= [];
    order.diskUrl ??= "";
    order.diskNote ??= "";
    order.replacing = Boolean(order.replacing);
    if (typeof order.replaceHintAt !== "string" || !order.replaceHintAt) order.replaceHintAt = null;
    if (order.kind !== "sticker" && order.kind !== "photo") {
      order.kind = /стикер/i.test(`${order.articleTitle} ${order.vendorCode}`) ? "sticker" : "photo";
    }
    if (typeof order.archivedAt !== "string") order.archivedAt = order.printStatus === "done" ? order.updatedAt || null : null;
    if (order.intakeMode === "choice") order.intakeMode = "photos";
  }
  return db;
}

function write(db: Database) {
  ensureDir(dataRoot());
  const file = dbFile();
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, file);
}

function read(): Database {
  const file = dbFile();
  if (!fs.existsSync(file)) {
    const db = seed();
    write(db);
    return db;
  }
  return normalize(JSON.parse(fs.readFileSync(file, "utf8")) as Database);
}

export function readDb(): Database {
  return read();
}

export function withDb<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const db = read();
    const result = await fn(db);
    write(db);
    return result;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function seenEvent(db: Database, eventId: string | undefined): boolean {
  if (!eventId) return false;
  if (db.settings.seenEventIds.includes(eventId)) return true;
  db.settings.seenEventIds.push(eventId);
  if (db.settings.seenEventIds.length > 5000) {
    db.settings.seenEventIds.splice(0, db.settings.seenEventIds.length - 4000);
  }
  return false;
}
