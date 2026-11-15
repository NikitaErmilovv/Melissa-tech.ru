import fs from "fs";
import path from "path";
import sharp from "sharp";
import type { FileSource, Order, OrderFile } from "./types";
import { ensureDir, safeAbs, uid } from "./paths";

const MAX_BYTES = 30 * 1024 * 1024;

export function sniffImage(buf: Buffer): { ext: string; mime: string } | null {
  if (buf.length < 12 || buf.length > MAX_BYTES) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buf.subarray(0, 8).equals(png)) return { ext: "png", mime: "image/png" };
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return { ext: "webp", mime: "image/webp" };
  }
  const gif = buf.subarray(0, 6).toString("ascii");
  if (gif === "GIF87a" || gif === "GIF89a") return { ext: "gif", mime: "image/gif" };
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("ascii");
    if (/heic|heix|heif|mif1|msf1|avif/.test(brand)) {
      return { ext: brand.startsWith("avi") ? "avif" : "heic", mime: brand.startsWith("avi") ? "image/avif" : "image/heic" };
    }
  }
  return null;
}

/** iPhone/VK часто шлют HEIC — в превью браузер их не рисует; перед записью в JPG. */
export async function browserSafeImage(bytes: Buffer): Promise<Buffer> {
  const kind = sniffImage(bytes);
  if (!kind) return bytes;
  const convert =
    kind.ext === "heic" || kind.ext === "heif" || kind.ext === "avif" || kind.mime === "image/heic";
  if (!convert) return bytes;
  const out = await sharp(bytes, { failOn: "none", animated: false }).rotate().jpeg({ quality: 91 }).toBuffer();
  if (!sniffImage(out)) throw new Error("не удалось преобразовать фото");
  return out;
}

export async function squareCropTopLeft(bytes: Buffer): Promise<{ bytes: Buffer; cropped: boolean }> {
  const meta = await sharp(bytes, { failOn: "none", animated: false }).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width < 1 || height < 1) throw new Error("нет размера");
  const orientation = meta.orientation ?? 1;
  const swapped = orientation >= 5 && orientation <= 8;
  const visualWidth = swapped ? height : width;
  const visualHeight = swapped ? width : height;
  const side = Math.min(visualWidth, visualHeight);
  const cropped = visualWidth !== visualHeight;
  if (!cropped && orientation <= 1) return { bytes, cropped: false };

  let pipeline = sharp(bytes, { failOn: "none", animated: false }).rotate();
  if (cropped) pipeline = pipeline.extract({ left: 0, top: 0, width: side, height: side });
  const format = meta.format;
  const out =
    format === "png"
      ? await pipeline.png().toBuffer()
      : format === "webp"
        ? await pipeline.webp({ quality: 92 }).toBuffer()
        : format === "gif"
          ? await pipeline.png().toBuffer()
          : await pipeline.jpeg({ quality: 92 }).toBuffer();
  if (!sniffImage(out)) throw new Error("после обрезки не фото");
  return { bytes: out, cropped };
}

export async function savePreparedFile(
  order: Order,
  bytes: Buffer,
  source: FileSource,
): Promise<{ saved: OrderFile | { error: string }; cropped: boolean; failed: boolean }> {
  let payload = bytes;
  try {
    payload = await browserSafeImage(payload);
  } catch {
    return { saved: { error: "файл не похож на фото" }, cropped: false, failed: true };
  }
  let cropped = false;
  let failed = false;
  if (order.kind === "sticker") {
    try {
      const square = await squareCropTopLeft(bytes);
      payload = square.bytes;
      cropped = square.cropped;
    } catch {
      failed = true;
    }
  }
  let saved = saveOrderFile(order, payload, source);
  if ("error" in saved && payload !== bytes) {
    saved = saveOrderFile(order, bytes, source);
    cropped = false;
    failed = true;
  }
  return { saved, cropped, failed };
}

export function saveOrderFile(
  order: Order,
  bytes: Buffer,
  source: FileSource,
): OrderFile | { error: string } {
  const kind = sniffImage(bytes);
  if (!kind) return { error: "это не фотография" };
  const dir = safeAbs(order.folderRel);
  if (!dir) return { error: "папка заказа недоступна" };
  ensureDir(dir);
  const name = `${String(order.files.length + 1).padStart(3, "0")}.${kind.ext}`;
  const relPath = path.posix.join(order.folderRel.replaceAll("\\", "/"), name);
  const abs = safeAbs(relPath);
  if (!abs) return { error: "имя файла отклонено" };
  fs.writeFileSync(abs, bytes);
  const file: OrderFile = {
    id: uid("file"),
    name,
    relPath,
    bytes: bytes.length,
    contentType: kind.mime,
    source,
    addedAt: new Date().toISOString(),
  };
  order.files.push(file);
  order.lastPhotoAt = file.addedAt;
  order.updatedAt = file.addedAt;
  return file;
}

export async function readBodyCap(res: Response, max = MAX_BYTES): Promise<Buffer> {
  const reader = res.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Buffer[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      throw new Error("файл больше 30 МБ");
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}
