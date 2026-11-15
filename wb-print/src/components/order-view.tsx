"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { intakePath } from "@/lib/intake-link";
import { countPhrase } from "@/lib/text";
import type { PrintStatus } from "@/lib/types";
import { formatStamp, formatTime } from "@/lib/time";
import { postJson, send, useDesk } from "./use-desk";

const STATUSES: { id: PrintStatus; label: string }[] = [
  { id: "new", label: "Новый" },
  { id: "printing", label: "В печати" },
  { id: "done", label: "Готово" },
  { id: "defect", label: "Брак" },
  { id: "cancelled", label: "Отменён" },
];

export function OrderView({ id }: { id: string }) {
  const router = useRouter();
  const { data, reload } = useDesk();
  const order = data?.orders.find((item) => item.id === id);
  const [wbOrderId, setWbOrderId] = useState("");
  const [expected, setExpected] = useState("");
  const [articleId, setArticleId] = useState("");
  const [primed, setPrimed] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [buyerText, setBuyerText] = useState("Досылаю ещё фото");
  const [buyerCount, setBuyerCount] = useState("3");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!order || primed) return;
    setWbOrderId(order.wbOrderId);
    setExpected(String(order.expectedPhotos));
    const match = data?.articles.find((article) => article.vendorCode === order.vendorCode);
    setArticleId(match?.id ?? "");
    setPrimed(true);
  }, [order, primed, data?.articles]);

  async function run(label: string, task: () => Promise<unknown>) {
    setBusy(label);
    setNote("");
    try {
      await task();
      await reload();
    } catch (error) {
      setNote(error instanceof Error ? error.message : "не получилось");
    } finally {
      setBusy("");
    }
  }

  if (!data) return <p className="text-sm text-muted-foreground">Открываю папку…</p>;
  if (!order) {
    return (
      <div className="sheet p-6">
        <p className="font-serif text-2xl">Папки нет</p>
        <Link href="/" className="mt-3 inline-block text-sm underline">
          На стол
        </Link>
      </div>
    );
  }

  const left = Math.max(order.expectedPhotos - order.files.length, 0);
  const pct = order.expectedPhotos > 0 ? Math.min(100, Math.round((order.files.length / order.expectedPhotos) * 100)) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link href="/" className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
              К столу
            </Link>
            <h1 className="mt-1 font-heading text-4xl font-black tracking-[-0.05em] leading-none">№ {order.wbOrderId}</h1>
            <p className="mt-2 text-sm">
              {order.articleTitle}
              {order.clientName ? ` · ${order.clientName}` : ""}
            </p>
            {order.source === "wb" && order.intakeToken ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Страница загрузки для покупателя:{" "}
                <a
                  className="underline"
                  href={`/upload/${encodeURIComponent(intakePath(order).slug)}/${encodeURIComponent(order.intakeToken)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  открыть
                </a>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <a className={buttonVariants({ variant: "outline", className: "h-10" })} href={`/api/orders/${order.id}/zip`}>
              Скачать архив
            </a>
            <Link className={buttonVariants({ className: "h-10" })} href={`/orders/${order.id}/print`} target="_blank">
              Печатать
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <Button
              key={status.id}
              type="button"
              variant={order.printStatus === status.id ? "default" : "outline"}
              className="h-10"
              disabled={Boolean(busy)}
              onClick={() => run("статус", () => postJson(`/api/orders/${order.id}`, { printStatus: status.id }, "PATCH"))}
            >
              {status.label}
            </Button>
          ))}
        </div>

        <section className="sheet p-4">
          <div className="flex items-baseline justify-between">
            <p className="font-serif text-3xl leading-none">
              {order.files.length}
              <span className="text-lg text-muted-foreground"> / {order.expectedPhotos || "—"}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {order.expectedPhotos > 0 && left === 0 ? (order.kind === "sticker" ? "макеты в папке" : "все фото в папке") : order.expectedPhotos > 0 ? `ещё не хватает ${left}` : "задайте число в артикуле"}
            </p>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#ffc5ee]" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Папка на компьютере: data/{order.folderRel}</p>
          {order.replacing ? <p className="mt-2 text-xs">Покупатель написал «замена». Жду новый набор фотографий.</p> : null}
          {!order.replacing && order.completedNoticeAt && order.expectedPhotos > 0 && order.files.length >= order.expectedPhotos ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {Date.now() > new Date(order.completedNoticeAt).getTime() + 30 * 60 * 1000
                ? "Набор принят. Время на замену вышло."
                : `Набор принят. Замена до ${formatTime(new Date(new Date(order.completedNoticeAt).getTime() + 30 * 60 * 1000).toISOString())}: сначала слово «замена», затем новые фотографии.`}
            </p>
          ) : null}
          {order.pending > 0 ? <p className="mt-1 text-xs">WB ещё проверяет {order.pending} файл(ов), заберём следующим опросом.</p> : null}
        </section>

        <section>
          <h2 className="text-sm tracking-[0.14em] text-muted-foreground uppercase">Фото</h2>
          {order.files.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Пока пусто. Что придёт в чат, ляжет сюда сразу, даже если это не весь заказ.</p> : null}
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {order.files.map((file) => (
              <a key={file.id} href={`/api/files/${order.id}/${file.id}`} target="_blank" className="sheet block overflow-hidden">
                {file.contentType.includes("heic") ? (
                  <div className="grid h-36 place-items-center text-xs">HEIC · {file.name}</div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/files/${order.id}/${file.id}`} alt={file.name} className="h-36 w-full object-cover" />
                )}
                <p className="px-2 py-1 text-xs text-muted-foreground">{file.name}</p>
              </a>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = event.target.files;
              if (!files?.length) return;
              const form = new FormData();
              for (const file of files) form.append("files", file);
              void run("загрузка", () => send(`/api/orders/${order.id}/upload`, { method: "POST", body: form }));
              event.target.value = "";
            }}
          />
          <Button type="button" variant="outline" className="mt-3 h-10" disabled={Boolean(busy)} onClick={() => fileRef.current?.click()}>
            Добавить фото с компьютера
          </Button>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="sheet space-y-3 p-4">
          <h2 className="text-sm">Папка</h2>
          <div className="space-y-1">
            <Label htmlFor="wb-id">Номер заказа WB</Label>
            <Input id="wb-id" value={wbOrderId} onChange={(event) => setWbOrderId(event.target.value)} className="h-10 bg-background" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="expect">{order.kind === "sticker" ? "Сколько стикеров ждать" : "Сколько фото ждать"}</Label>
            <Input id="expect" inputMode="numeric" value={expected} onChange={(event) => setExpected(event.target.value)} className="h-10 bg-background" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="article">Артикул</Label>
            <select
              id="article"
              value={articleId}
              onChange={(event) => setArticleId(event.target.value)}
              className="h-10 w-full border border-input bg-background px-2 text-sm"
            >
              <option value="">не менять</option>
              {data.articles.map((article) => (
                <option key={article.id} value={article.id}>
                  {article.title} · {countPhrase(article.photoCount, article.kind || "sticker")}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            className="h-10 w-full"
            disabled={Boolean(busy)}
            onClick={() =>
              run("правка", () =>
                postJson(
                  `/api/orders/${order.id}`,
                  {
                    wbOrderId,
                    expectedPhotos: articleId ? undefined : Number(expected),
                    articleId: articleId || undefined,
                  },
                  "PATCH",
                ),
              )
            }
          >
            Сохранить правки
          </Button>
          <p className="text-xs text-muted-foreground">Если выбран артикул, число файлов берётся из него. Стикеры сохраняются в отдельную папку.</p>
        </section>

        <section className="sheet space-y-2 p-4">
          <h2 className="text-sm">Покупатель</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Фото только со страницы загрузки по ссылке из чата WB. Замена: слово «замена» в течение 30 минут, затем новые файлы на сайте.
          </p>
        </section>

        <section className="sheet space-y-3 p-4">
          <h2 className="text-sm">Как будто покупатель написал</h2>
          <Textarea value={buyerText} onChange={(event) => setBuyerText(event.target.value)} rows={3} />
          <div className="space-y-1">
            <Label htmlFor="more">Сколько фото приложить</Label>
            <Input id="more" inputMode="numeric" value={buyerCount} onChange={(event) => setBuyerCount(event.target.value)} className="h-10 bg-background" />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="h-10 w-full"
            disabled={Boolean(busy)}
            onClick={() =>
              run("сообщение", () =>
                postJson("/api/demo", {
                  orderId: order.id,
                  text: buyerText,
                  photoCount: Number(buyerCount) || 0,
                }),
              )
            }
          >
            Принять в эту папку
          </Button>
          <Button type="button" variant="ghost" className="h-10 w-full" disabled={Boolean(busy)} onClick={() => run("напоминание", () => postJson(`/api/orders/${order.id}/remind`, {}))}>
            Напомнить сейчас
          </Button>
        </section>

        <section className="sheet p-4">
          <h2 className="text-sm">Переписка</h2>
          <ul className="mt-3 max-h-80 space-y-3 overflow-auto">
            {order.log.slice().reverse().map((line, index) => (
              <li key={`${line.at}-${index}`} className="text-xs leading-relaxed">
                <p className="text-muted-foreground">
                  {formatStamp(line.at)} · {line.kind === "in" ? "покупатель" : line.kind === "out" ? (line.delivered ? "в чат WB" : "в панели") : "стол"}
                </p>
                <p className="whitespace-pre-wrap">{line.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {note ? <p className="text-sm text-destructive">{note}</p> : null}
        {busy ? <p className="text-sm text-muted-foreground">{busy}…</p> : null}

        <Button type="button" variant="destructive" className="h-10" onClick={() => setConfirmDelete(true)}>
          Удалить папку
        </Button>
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить папку № {order.wbOrderId}?</DialogTitle>
              <DialogDescription>Фото с компьютера тоже сотрутся. В чат покупателя ничего не уйдёт.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
                Оставить
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  run("удаление", async () => {
                    await send(`/api/orders/${order.id}`, { method: "DELETE" });
                    router.push("/");
                  })
                }
              >
                Удалить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </aside>
    </div>
  );
}
