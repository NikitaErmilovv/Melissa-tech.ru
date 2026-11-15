import { deliver, downloadIntoOrder } from "./bot";
import { pushLog, readDb, withDb } from "./db";
import { publicIntakeView } from "./intake-token";
import { addUploads } from "./panel";
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
  } else if (got > gotBefore && got < need) {
    text = fill(snap.templates.progress, orderVars(order));
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

export async function intakeDiskUrl(orderId: string, url: string) {
  const order = readDb().orders.find((item) => item.id === orderId);
  if (!order) throw new Error("ссылка устарела или заказ не найден");
  if (order.printStatus === "cancelled" || order.printStatus === "defect") {
    throw new Error("заказ отменён, файлы больше не принимаем");
  }
  const target = url.trim();
  if (!target) throw new Error("вставьте ссылку на диск");
  const before = order.files.length;
  await withDb((db) => {
    const row = db.orders.find((item) => item.id === order.id);
    if (row) {
      pushLog(row, "in", "Сайт: ссылка на диск");
      row.intakeMode = "link";
      row.diskUrl = target;
      row.lastReminderAt = null;
    }
  });
  const pulled = await downloadIntoOrder(order.id, target);
  await notifyIntakeProgress(order.id, before);
  const live = readDb().orders.find((item) => item.id === order.id);
  return { ...pulled, view: live ? publicIntakeView(live) : publicIntakeView(order) };
}