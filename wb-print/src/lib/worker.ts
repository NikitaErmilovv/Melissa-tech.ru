import { attachBytes, deliver, ingest } from "./bot";
import { pushLog, readDb, seenEvent, withDb } from "./db";
import { sniffImage } from "./images";
import { fill, orderVars, parseOrderDigits } from "./text";
import type { Order } from "./types";
import {
  downloadAttachment,
  downloadChatFile,
  downloadPublicImage,
  fetchStatuses,
  listRecentFbs,
  pullEvents,
  type RemoteFbsOrder,
  type WbEvent,
} from "./wb";

const WB_CANCEL = new Set(["canceled", "canceled_by_client", "declined_by_client"]);

interface Memory {
  lastTickAt: string | null;
  lastError: string;
  lastEventCount: number;
  ticking: boolean;
}

const globalState = globalThis as typeof globalThis & {
  __wbPrint?: { memory: Memory; gate: Promise<unknown>; started: boolean };
};

function slot() {
  if (!globalState.__wbPrint) {
    globalState.__wbPrint = {
      memory: { lastTickAt: null, lastError: "", lastEventCount: 0, ticking: false },
      gate: Promise.resolve(),
      started: false,
    };
  }
  return globalState.__wbPrint;
}

export function workerSnapshot(): Memory & { mode: "live" | "demo" } {
  let mode: "live" | "demo" = "demo";
  try {
    if (readDb().settings.token.trim()) mode = "live";
  } catch {
    mode = "demo";
  }
  return { ...slot().memory, mode };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function eventTime(event: WbEvent): number | null {
  const raw = event.addTimestamp ?? event.message?.addTimestamp;
  if (typeof raw !== "number") return null;
  return raw < 1e12 ? raw * 1000 : raw;
}

function eventKey(event: WbEvent): string {
  if (event.eventID) return event.eventID;
  return `fallback:${event.chatID ?? ""}:${event.addTimestamp ?? ""}:${event.message?.text?.slice(0, 40) ?? ""}`;
}

const IDLE_UPLOAD_MS = 60 * 60 * 1000;

function dueIdleUploadNudges(orders: Order[], now: number) {
  return orders.filter((order) => {
    if (order.source !== "wb") return false;
    if (order.printStatus === "cancelled" || order.printStatus === "defect") return false;
    if (order.expectedPhotos <= 0 || order.files.length > 0) return false;
    if (order.intakeMode === "link" && order.diskUrl.trim()) return false;
    if (order.intakeMode === "choice") return false;
    if (order.idleNudgeAt) return false;
    const anchor = order.greetedAt || order.createdAt;
    if (!anchor) return false;
    return now - new Date(anchor).getTime() >= IDLE_UPLOAD_MS;
  });
}

function dueOrders(orders: Order[], silenceMin: number, remindMin: number, now: number) {
  const waitAfterActivity = silenceMin * 60_000;
  const gapBetweenReminders = remindMin * 60_000;
  return orders.filter((order) => {
    if (order.printStatus === "cancelled" || order.printStatus === "defect") return false;
    if (order.completedNoticeAt && order.files.length >= order.expectedPhotos) return false;
    if (order.expectedPhotos <= 0 || order.files.length >= order.expectedPhotos) return false;
    if (order.files.length === 0) return false;
  /* Ссылку уже дали — не дожимаем; ответы только из скачивания и «всё принято». */
    if (order.intakeMode === "link" && order.diskUrl.trim()) return false;
    if (order.intakeMode === "choice" && order.files.length === 0) return false;
    const anchor = order.lastPhotoAt || order.greetedAt;
    if (!anchor) return false;
    if (now - new Date(anchor).getTime() < waitAfterActivity) return false;
    if (order.lastReminderAt && now - new Date(order.lastReminderAt).getTime() < gapBetweenReminders) return false;
    return true;
  });
}

async function runReminders() {
  const db = readDb();
  if (!db.settings.token.trim() || !db.settings.liveReplies) return;
  const now = Date.now();
  for (const order of dueIdleUploadNudges(db.orders, now)) {
    const snap = readDb();
    const live = snap.orders.find((item) => item.id === order.id);
    if (!live) continue;
    const text = fill(snap.templates.idleNudge, orderVars(live));
    const sentAt = new Date().toISOString();
    await withDb((draft) => {
      const row = draft.orders.find((item) => item.id === order.id);
      if (!row || row.idleNudgeAt) return;
      if (row.printStatus === "cancelled" || row.printStatus === "defect") return;
      row.idleNudgeAt = sentAt;
    });
    const again = readDb().orders.find((item) => item.id === order.id);
    if (!again?.idleNudgeAt || again.idleNudgeAt !== sentAt) continue;
    if (again.printStatus === "cancelled" || again.printStatus === "defect") continue;
    await deliver(order.id, text);
  }
  const due = dueOrders(db.orders, db.settings.silenceMin, db.settings.remindMin, now);
  for (const order of due) {
    const snap = readDb();
    const live = snap.orders.find((item) => item.id === order.id);
    if (!live) continue;
    const text =
      live.intakeMode === "link" && !live.diskUrl.trim()
        ? fill(snap.templates.askLink, orderVars(live))
        : fill(snap.templates.reminder, orderVars(live));
    await withDb((draft) => {
      const row = draft.orders.find((item) => item.id === order.id);
      if (row) row.lastReminderAt = new Date().toISOString();
    });
    await deliver(order.id, text);
  }
}

async function armWatch() {
  if (readDb().settings.watchFrom > 0) return;
  const now = Date.now();
  await withDb((draft) => {
    draft.settings.watchFrom = now;
    draft.settings.eventNext = now;
    draft.settings.eventSeenUntil = now;
    draft.settings.eventCaughtUp = true;
    draft.settings.chatSigns = {};
    draft.fbsOrders = [];
    draft.fbsFetchedAt = null;
  });
}

async function syncStatuses(token: string) {
  const db = readDb();
  const last = db.settings.lastStatusSyncAt ? new Date(db.settings.lastStatusSyncAt).getTime() : 0;
  if (Date.now() - last < 45_000) return;
  const ids = db.orders
    .filter((order) => order.source === "wb" && /^\d+$/.test(order.wbOrderId))
    .filter((order) => Date.now() - new Date(order.createdAt).getTime() < 14 * 24 * 3600 * 1000)
    .map((order) => Number(order.wbOrderId));
  const statuses: { id: number; supplierStatus: string; wbStatus: string }[] = [];
  for (let i = 0; i < ids.length; i += 1000) {
    statuses.push(...(await fetchStatuses(token, ids.slice(i, i + 1000))));
  }
  await withDb((draft) => {
    for (const status of statuses) {
      const order = draft.orders.find((item) => item.wbOrderId === String(status.id));
      if (!order) continue;
      const cancelled = status.supplierStatus === "cancel" || WB_CANCEL.has(status.wbStatus);
      const defect = status.wbStatus === "defect";
      if (order.printStatus === "done") {
        if ((cancelled || defect) && !order.log.some((line) => line.text.includes("папка уже со статусом"))) {
          pushLog(order, "system", "На Wildberries заказ закрыт или отменён, но папка уже со статусом «готово» — печать не трогаю.");
        }
        continue;
      }
      if (defect && order.printStatus !== "defect") {
        order.printStatus = "defect";
        pushLog(order, "system", "Wildberries пометил заказ как брак. Напоминания остановлены, покупателю не пишем.");
      } else if (cancelled && order.printStatus !== "cancelled") {
        order.printStatus = "cancelled";
        pushLog(order, "system", "На Wildberries заказ отменён. Папка помечена, покупателю не пишем.");
      }
    }
    draft.settings.lastStatusSyncAt = new Date().toISOString();
  });
}

function newestStamp(events: WbEvent[]) {
  let newest = 0;
  for (const event of events) {
    const ts = eventTime(event);
    if (ts && ts > newest) newest = ts;
  }
  return newest;
}

function pickWrittenOrder(orders: RemoteFbsOrder[], rid: string, digits: string | null) {
  if (rid) {
    const byRid = orders.find((order) => order.rid && order.rid === rid);
    if (byRid) return byRid;
  }
  if (digits) return orders.find((order) => String(order.id) === digits);
  return undefined;
}

function looksLikeImage(file: { contentType?: string; name?: string; url?: string }) {
  if (!file.contentType || file.contentType === "image/*") return true;
  const hint = `${file.contentType} ${file.name || ""} ${file.url || ""}`;
  if (/pdf|zip|svg|html|xml|octet-stream|video|audio/i.test(file.contentType)) return false;
  return /image|jpe?g|png|webp|heic|gif/i.test(hint);
}

function pendingId(file: { downloadID?: string; url?: string }) {
  if (file.downloadID) return file.downloadID;
  if (file.url) return `url:${file.url}`;
  return "";
}

async function drainEvents(token: string) {
  let next = readDb().settings.eventNext;
  if (!next) {
    const now = Date.now();
    await withDb((draft) => {
      draft.settings.eventNext = now;
      if (draft.settings.eventSeenUntil < now) draft.settings.eventSeenUntil = now;
    });
    return 0;
  }
  let seen = 0;
  let assembly: RemoteFbsOrder[] | null = null;
  for (let page = 0; page < 3; page++) {
    const batch = await pullEvents(token, next);
    const floor = readDb().settings.eventSeenUntil;
    for (const event of batch.events) {
      seen += 1;
      const key = eventKey(event);
      if (readDb().settings.seenEventIds.includes(key)) continue;
      const ts = eventTime(event);
      if (ts && ts <= floor) continue;
      if ((event.sender && event.sender !== "client") || (event.eventType && event.eventType !== "message")) continue;
      const chat = event.chatID ? readDb().settings.chatSigns[event.chatID] : undefined;
      const images: { bytes: Buffer; source: "chat" }[] = [];
      const pending: { id: string; name: string }[] = [];
      const files = [
        ...(event.message?.attachments?.images ?? []).map((image) => ({
          downloadID: image.downloadID,
          url: image.url,
          name: image.name,
          contentType: "image/*",
        })),
        ...(event.message?.attachments?.files ?? []),
      ];
      const text = event.message?.text || "";
      if (!text.trim() && files.length === 0) continue;
      for (const file of files) {
        if (!looksLikeImage(file)) continue;
        const id = pendingId(file);
        if (!id) continue;
        await sleep(120);
        try {
          const got = await downloadAttachment(token, file);
          if ("pending" in got) pending.push({ id, name: file.name || "" });
          else if (sniffImage(got.bytes)) images.push({ bytes: got.bytes, source: "chat" });
        } catch {
          pending.push({ id, name: file.name || "" });
        }
      }
      const card = event.message?.attachments?.goodCard;
      const digits = parseOrderDigits(text);
      let rid = card?.rid || chat?.rid || "";
      let nmId = card?.nmID ?? chat?.nmId ?? null;
      let wbOrderId = digits ?? "";
      let vendorCode = "";
      let orderUid = "";
      if ((rid || digits) && !assembly) {
        try {
          assembly = await listRecentFbs(token);
        } catch {
          assembly = [];
        }
      }
      const hit = assembly ? pickWrittenOrder(assembly, rid, digits) : undefined;
      if (hit) {
        wbOrderId = String(hit.id);
        vendorCode = hit.article;
        orderUid = hit.orderUid;
        if (!rid) rid = hit.rid;
        if (!nmId) nmId = hit.nmId;
      }
      const result = await ingest({
        eventId: key,
        chatId: event.chatID,
        replySign: event.replySign || chat?.replySign,
        clientName: event.clientName || chat?.clientName,
        text,
        nmId,
        rid,
        vendorCode,
        wbOrderId,
        orderUid,
        images,
        source: "wb",
      });
      await withDb((draft) => {
        seenEvent(draft, key);
        if (ts && ts > draft.settings.eventSeenUntil) draft.settings.eventSeenUntil = ts;
        if (!pending.length || !result.orderId) return;
        const order = draft.orders.find((item) => item.id === result.orderId);
        if (!order) return;
        for (const item of pending) {
          if (!order.pendingDownloads.some((row) => row.id === item.id)) {
            order.pendingDownloads.push({ id: item.id, name: item.name, tries: 0 });
          }
        }
      });
    }
    const newest = newestStamp(batch.events);
    next = batch.next ?? (newest || next);
    await withDb((draft) => {
      if (typeof next === "number") draft.settings.eventNext = next;
      if (newest > draft.settings.eventSeenUntil) draft.settings.eventSeenUntil = newest;
    });
    if (!batch.total) break;
  }
  return seen;
}

async function retryPending(token: string) {
  const queue = readDb().orders.flatMap((order) =>
    order.pendingDownloads.filter((item) => item.tries < 5).map((item) => ({ orderId: order.id, ...item })),
  );
  for (const item of queue.slice(0, 6)) {
    await sleep(120);
    try {
      const got = item.id.startsWith("url:")
        ? await downloadPublicImage(item.id.slice(4))
        : await downloadChatFile(token, item.id);
      if ("pending" in got) {
        await withDb((draft) => {
          const row = draft.orders.find((order) => order.id === item.orderId)?.pendingDownloads.find((file) => file.id === item.id);
          if (row) row.tries += 1;
        });
        continue;
      }
      if (!sniffImage(got.bytes)) {
        await withDb((draft) => {
          const order = draft.orders.find((row) => row.id === item.orderId);
          if (order) order.pendingDownloads = order.pendingDownloads.filter((file) => file.id !== item.id);
        });
        continue;
      }
      await attachBytes(item.orderId, got.bytes, "chat");
      await withDb((draft) => {
        const order = draft.orders.find((row) => row.id === item.orderId);
        if (order) order.pendingDownloads = order.pendingDownloads.filter((file) => file.id !== item.id);
      });
    } catch {
      await withDb((draft) => {
        const row = draft.orders.find((order) => order.id === item.orderId)?.pendingDownloads.find((file) => file.id === item.id);
        if (row) row.tries += 1;
      });
    }
  }
}

async function tickBody(): Promise<number> {
  await runReminders();
  const token = readDb().settings.token.trim();
  if (!token) return 0;
  await armWatch();
  await syncStatuses(token);
  if (!readDb().settings.liveReplies) return 0;
  const seen = await drainEvents(token);
  await retryPending(token);
  return seen;
}

export function tick(): Promise<number> {
  const state = slot();
  const run = state.gate.then(() => tickBody());
  state.gate = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function startWorker() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const state = slot();
  if (state.started) return;
  state.started = true;
  const loop = async () => {
    const memory = slot().memory;
    if (!memory.ticking) {
      memory.ticking = true;
      try {
        memory.lastEventCount = await tick();
        memory.lastTickAt = new Date().toISOString();
        memory.lastError = "";
      } catch (error) {
        memory.lastTickAt = new Date().toISOString();
        memory.lastError = error instanceof Error ? error.message : "сбой опроса";
      } finally {
        memory.ticking = false;
      }
    }
    setTimeout(loop, 4000);
  };
  void loop();
}
