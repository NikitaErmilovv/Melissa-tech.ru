import { readBodyCap } from "./images";

const CHAT = "https://buyer-chat-api.wildberries.ru";
const FBS = "https://marketplace-api.wildberries.ru";
const IMAGE_HOST = /(^|\.)((wbbasket|wbstatic)\.ru|wildberries\.ru|wb\.ru)$/i;

export interface WbEvent {
  chatID?: string;
  eventID?: string;
  eventType?: string;
  isNewChat?: boolean;
  replySign?: string;
  sender?: string;
  clientName?: string;
  addTimestamp?: number;
  message?: {
    text?: string;
    addTimestamp?: number;
    attachments?: {
      goodCard?: { nmID?: number; rid?: string };
      images?: { downloadID?: string; url?: string; name?: string }[];
      files?: { downloadID?: string; url?: string; contentType?: string; name?: string }[];
    };
  };
}

export interface WbChat {
  chatID: string;
  replySign: string;
  clientName: string;
  nmId: number | null;
  rid: string;
}

async function wbFetch(url: string, token: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", token);
  const res = await fetch(url, { ...init, headers, signal: AbortSignal.timeout(20000) });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WB ${res.status}: ${body.slice(0, 220)}`);
  }
  return res;
}

export async function loadChats(token: string): Promise<WbChat[]> {
  const res = await wbFetch(`${CHAT}/api/v1/seller/chats`, token);
  const json = (await res.json()) as { result?: unknown };
  const rows = Array.isArray(json.result) ? json.result : [];
  return rows.map((row) => {
    const item = row as {
      chatID?: string;
      replySign?: string;
      clientName?: string;
      goodCard?: { nmID?: number; rid?: string };
    };
    return {
      chatID: item.chatID || "",
      replySign: item.replySign || "",
      clientName: item.clientName || "",
      nmId: item.goodCard?.nmID ?? null,
      rid: item.goodCard?.rid || "",
    };
  }).filter((chat) => chat.chatID);
}

export async function pullEvents(token: string, next: number | null): Promise<{
  events: WbEvent[];
  next: number | null;
  total: number;
}> {
  const url = new URL(`${CHAT}/api/v1/seller/events`);
  if (next) url.searchParams.set("next", String(next));
  const res = await wbFetch(url.toString(), token);
  const json = (await res.json()) as {
    result?: { events?: WbEvent[]; next?: number; totalEvents?: number };
  };
  return {
    events: json.result?.events ?? [],
    next: json.result?.next ?? null,
    total: json.result?.totalEvents ?? 0,
  };
}

export async function downloadChatFile(token: string, id: string): Promise<
  { bytes: Buffer; contentType: string } | { pending: true }
> {
  const res = await fetch(`${CHAT}/api/v1/seller/download/${encodeURIComponent(id)}`, {
    headers: { Authorization: token },
    signal: AbortSignal.timeout(20000),
  });
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("json") || contentType.includes("text")) {
    const json = (await res.json().catch(() => ({}))) as { moderationState?: string; error?: string };
    if (json.moderationState) return { pending: true };
    throw new Error(JSON.stringify(json).slice(0, 180) || `скачивание ${res.status}`);
  }
  if (!res.ok) throw new Error(`скачивание ${res.status}`);
  const bytes = await readBodyCap(res);
  return { bytes, contentType };
}

function hostAllowed(hostname: string) {
  return IMAGE_HOST.test(hostname);
}

export async function downloadPublicImage(raw: string): Promise<{ bytes: Buffer; contentType: string }> {
  let current = raw;
  for (let hop = 0; hop < 4; hop++) {
    const url = new URL(current);
    if (url.protocol !== "https:" || url.username || url.password || !hostAllowed(url.hostname)) {
      throw new Error("ссылка на фото не из Wildberries");
    }
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20000) });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new Error("перенаправление без адреса");
      current = new URL(location, url).toString();
      continue;
    }
    if (!res.ok) throw new Error(`фото ${res.status}`);
    const bytes = await readBodyCap(res);
    return { bytes, contentType: res.headers.get("content-type") || "" };
  }
  throw new Error("слишком много перенаправлений");
}

export async function downloadAttachment(
  token: string,
  file: { downloadID?: string; url?: string },
): Promise<{ bytes: Buffer; contentType: string } | { pending: true }> {
  if (file.downloadID) {
    try {
      return await downloadChatFile(token, file.downloadID);
    } catch (error) {
      if (!file.url) throw error;
    }
  }
  if (file.url) return downloadPublicImage(file.url);
  throw new Error("нет файла");
}

export async function sendChatMessage(token: string, replySign: string, message: string): Promise<void> {
  const form = new FormData();
  form.append("replySign", replySign);
  form.append("message", message.slice(0, 1000));
  const res = await fetch(`${CHAT}/api/v1/seller/message`, {
    method: "POST",
    headers: { Authorization: token },
    body: form,
    signal: AbortSignal.timeout(20000),
  });
  const json = (await res.json().catch(() => ({}))) as { errors?: unknown };
  if (!res.ok || (Array.isArray(json.errors) && json.errors.length > 0)) {
    throw new Error(`сообщение ${res.status}: ${JSON.stringify(json.errors ?? json).slice(0, 180)}`);
  }
}

export interface RemoteFbsOrder {
  id: number;
  rid: string;
  nmId: number | null;
  article: string;
  orderUid: string;
  createdAt: string;
}

export async function listRecentFbs(token: string): Promise<RemoteFbsOrder[]> {
  const dateFrom = Math.floor((Date.now() - 14 * 24 * 3600 * 1000) / 1000);
  const all: RemoteFbsOrder[] = [];
  const seen = new Set<number>();
  let next = "0";
  for (let page = 0; page < 4; page++) {
    const url = `${FBS}/api/v3/orders?limit=1000&next=${next}&dateFrom=${dateFrom}`;
    const res = await wbFetch(url, token);
    const text = await res.text();
    // WB's cursor is larger than Number.MAX_SAFE_INTEGER, so it must stay a string.
    const nextToken = text.match(/"next"\s*:\s*(\d+)/)?.[1] ?? "0";
    const json = JSON.parse(text) as { orders?: Record<string, unknown>[] };
    const orders = json.orders ?? [];
    for (const order of orders) {
      const id = Number(order.id);
      if (!Number.isFinite(id) || seen.has(id)) continue;
      seen.add(id);
      all.push({
        id,
        rid: String(order.rid ?? ""),
        nmId: order.nmId == null ? null : Number(order.nmId),
        article: String(order.article ?? ""),
        orderUid: String(order.orderUid ?? ""),
        createdAt: String(order.createdAt ?? ""),
      });
    }
    if (orders.length === 0 || nextToken === "0" || nextToken === next) break;
    next = nextToken;
  }
  try {
    const fresh = await wbFetch(`${FBS}/api/v3/orders/new`, token);
    const json = (await fresh.json()) as { orders?: Record<string, unknown>[] };
    for (const order of json.orders ?? []) {
      const id = Number(order.id);
      if (all.some((item) => item.id === id)) continue;
      all.push({
        id,
        rid: String(order.rid ?? ""),
        nmId: order.nmId == null ? null : Number(order.nmId),
        article: String(order.article ?? ""),
        orderUid: String(order.orderUid ?? ""),
        createdAt: String(order.createdAt ?? ""),
      });
    }
  } catch {
    // The dated list is enough when /new is temporarily unavailable.
  }
  return all.filter((order) => Number.isFinite(order.id));
}

export async function fetchStatuses(token: string, ids: number[]): Promise<
  { id: number; supplierStatus: string; wbStatus: string }[]
> {
  if (ids.length === 0) return [];
  const res = await wbFetch(`${FBS}/api/v3/orders/status`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orders: ids.slice(0, 1000) }),
  });
  const json = (await res.json()) as {
    orders?: { id: number; supplierStatus?: string; wbStatus?: string }[];
  };
  return (json.orders ?? []).map((order) => ({
    id: order.id,
    supplierStatus: order.supplierStatus || "",
    wbStatus: order.wbStatus || "",
  }));
}
