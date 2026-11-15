import { readBodyCap, sniffImage } from "./images";
import type { FileSource } from "./types";

export interface PulledFile {
  bytes: Buffer;
  source: FileSource;
  name: string;
}

const MAX_FILES = 80;

function isYandex(url: string): boolean {
  return /yadi\.sk|disk\.yandex\.|yandex\.[a-z.]+\/(?:d|i)\//i.test(url);
}

function isGoogle(url: string): boolean {
  return /drive\.google\.com|docs\.google\.com/i.test(url);
}

function googleFileId(url: string): string | null {
  return (
    url.match(/\/file\/d\/([^/?#]+)/)?.[1] ??
    url.match(/[?&]id=([^&#]+)/)?.[1] ??
    null
  );
}

async function fetchBytes(url: string): Promise<{ buf: Buffer; contentType: string }> {
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`ответ ${res.status}`);
  const buf = await readBodyCap(res);
  return { buf, contentType: res.headers.get("content-type") || "" };
}

function keepImage(buf: Buffer, name: string, source: FileSource, files: PulledFile[]) {
  if (!sniffImage(buf)) return false;
  if (files.length >= MAX_FILES) return false;
  files.push({ bytes: buf, source, name });
  return true;
}

interface YandexItem {
  type?: string;
  name?: string;
  path?: string;
  file?: string;
  mime_type?: string;
  _embedded?: { items?: YandexItem[] };
}

async function yandexResource(publicKey: string, itemPath?: string): Promise<YandexItem> {
  const u = new URL("https://cloud-api.yandex.net/v1/disk/public/resources");
  u.searchParams.set("public_key", publicKey);
  u.searchParams.set("limit", "100");
  if (itemPath) u.searchParams.set("path", itemPath);
  const res = await fetch(u, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Яндекс Диск не открыл ссылку. Проверьте, что доступ по ссылке включён.");
    throw new Error(`Яндекс Диск ответил ${res.status}`);
  }
  return (await res.json()) as YandexItem;
}

async function collectYandex(publicKey: string, itemPath: string | undefined, depth: number, out: { href: string; name: string }[]) {
  if (out.length >= MAX_FILES) return;
  const node = await yandexResource(publicKey, itemPath);
  const items = node.type === "file" ? [node] : node._embedded?.items ?? [];
  for (const item of items) {
    if (out.length >= MAX_FILES) return;
    if (item.type === "dir" && item.path && depth < 2) {
      await collectYandex(publicKey, item.path, depth + 1, out);
      continue;
    }
    if (item.file) out.push({ href: item.file, name: item.name || "photo" });
  }
}

async function pullYandex(url: string): Promise<{ files: PulledFile[]; note: string }> {
  const listed: { href: string; name: string }[] = [];
  await collectYandex(url, undefined, 0, listed);
  const files: PulledFile[] = [];
  let skipped = 0;
  for (const item of listed) {
    try {
      const { buf } = await fetchBytes(item.href);
      if (!keepImage(buf, item.name, "yandex", files)) skipped += 1;
    } catch {
      skipped += 1;
    }
  }
  if (listed.length === 0) {
    return {
      files,
      note: "Яндекс Диск открылся, но фото внутри не нашлось. Проверьте, что ссылка ведёт на файлы и доступ открыт.",
    };
  }
  const note = `Яндекс Диск: картинок ${files.length}${skipped ? `, пропущено ${skipped}` : ""}. Беру только изображения, документы и программы не сохраняю.`;
  return { files, note };
}

async function pullGoogleFile(url: string): Promise<{ files: PulledFile[]; note: string }> {
  if (/\/folders\//.test(url)) {
    return {
      files: [],
      note: "Это папка Google Диска. Её целиком скачать нельзя: откройте ссылку и положите фото кнопкой загрузки в эту папку, либо пришлите прямую ссылку на файл.",
    };
  }
  const id = googleFileId(url);
  if (!id) {
    return { files: [], note: "Ссылку Google вижу, но id файла не разобрал. Откройте её вручную." };
  }
  let { buf, contentType } = await fetchBytes(`https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`);
  if (contentType.includes("text/html") || buf.subarray(0, 20).toString("utf8").includes("<html")) {
    const html = buf.toString("utf8");
    const confirm = html.match(/confirm=([0-9A-Za-z_]+)/)?.[1];
    if (!confirm) {
      return {
        files: [],
        note: "Google Диск не отдал файл. Нужен доступ «все, у кого есть ссылка», без входа в аккаунт.",
      };
    }
    const next = new URL("https://drive.google.com/uc");
    next.searchParams.set("export", "download");
    next.searchParams.set("id", id);
    next.searchParams.set("confirm", confirm);
    const uuid = html.match(/name="uuid"\s+value="([^"]+)"/)?.[1];
    if (uuid) next.searchParams.set("uuid", uuid);
    const second = await fetchBytes(next.toString());
    buf = second.buf;
    contentType = second.contentType;
  }
  const files: PulledFile[] = [];
  if (!keepImage(buf, "google", "gdrive", files)) {
    return {
      files,
      note: contentType.includes("html")
        ? "Google Диск вернул страницу вместо файла. Откройте доступ по ссылке."
        : "Файл с Google Диска — не фотография, я его не сохранил.",
    };
  }
  return { files, note: "Google Диск: фото скачано. Сохраняю только изображения." };
}

export async function pullPublicDisk(url: string): Promise<{ files: PulledFile[]; note: string }> {
  try {
    if (isYandex(url)) return await pullYandex(url);
    if (isGoogle(url)) return await pullGoogleFile(url);
    const { buf } = await fetchBytes(url);
    const files: PulledFile[] = [];
    if (!keepImage(buf, "link", "manual", files)) {
      return {
        files,
        note: "Ссылка не на Яндекс или Google, и по ней не открылась картинка. Она останется в папке, скачать можно вручную.",
      };
    }
    return { files, note: "По прямой ссылке скачалась одна картинка." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "не скачалось";
    return { files: [], note: message };
  }
}
