import fs from "fs";
import { deliver } from "./bot";
import { pushLog, readDb, withDb } from "./db";
import { publicIntakeView } from "./intake-token";
import { addUploads } from "./panel";
import { safeAbs } from "./paths";
import { fill, orderVars } from "./text";

export async function notifyIntakeProgress(orderId: string, gotBefore: number) {
  const snap = readDb();
  const order = snap.orders.find((item) => item.id === orderId);
  if (!order || order.source !== "wb") return;
  if (order.printStatus === "cancelled" || order.printStatus === "defect") return;
  const need = order.expectedPhotos;
  const got = order.files.length;
  if (need <= 0) return;

  const justDone = gotBefore < need && got >= need && !order.completedNoticeAt;
  let text = "";
  if (justDone) {
    text = fill(snap.templates.complete, orderVars(order));
    await withDb((db) => {
      const row = db.orders.find((item) => item.id === orderId);
      if (!row) return;
      row.completedNoticeAt = new Date().toISOString();
      row.replacing = false;
      row.replaceHintAt = null;
      row.lastReminderAt = null;
    });
  }
  if (text) await deliver(orderId, text);
}

export async function intakeUploadFiles(orderId: string, files: Buffer[]) {
  const order = readDb().orders.find((item) => item.id === orderId);
  if (!order) throw new Error("ссылка устарела или заказ не найден");
  if (order.printStatus === "cancelled" || order.printStatus === "defect") {
    throw new Error("заказ отменён, файлы больше не принимаем");
  }
  const before = order.files.length;
  await withDb((db) => {
    const row = db.orders.find((item) => item.id === order.id);
    if (row) {
      pushLog(row, "in", `Сайт: загружено файлов ${files.length}`);
      row.intakeMode = "photos";
      row.lastReminderAt = null;
    }
  });
  const result = await addUploads(order.id, files, "site");
  await notifyIntakeProgress(order.id, before);
  const live = readDb().orders.find((item) => item.id === order.id);
  return { ...result, view: live ? publicIntakeView(live) : publicIntakeView(order) };
}

export async function intakeRemoveFile(orderId: string, fileId: string) {
  const order = readDb().orders.find((item) => item.id === orderId);
  if (!order) throw new Error("ссылка устарела или заказ не найден");
  if (order.printStatus === "cancelled" || order.printStatus === "defect") {
    throw new Error("заказ отменён — файлы не меняем");
  }
  await withDb((db) => {
    const row = db.orders.find((item) => item.id === orderId);
    if (!row) throw new Error("заказ не найден");
    const index = row.files.findIndex((item) => item.id === fileId);
    if (index < 0) throw new Error("файл не найден");
    const [file] = row.files.splice(index, 1);
    const abs = safeAbs(file.relPath);
    if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    if (row.completedNoticeAt && row.files.length < row.expectedPhotos) {
      row.completedNoticeAt = null;
      row.replacing = true;
    }
    row.lastPhotoAt = row.files.at(-1)?.addedAt ?? null;
    row.updatedAt = new Date().toISOString();
    pushLog(row, "in", `Сайт: удалено фото ${file.name}`);
  });
  const live = readDb().orders.find((item) => item.id === orderId);
  if (!live) throw new Error("заказ не найден");
  return { view: publicIntakeView(live) };
}
