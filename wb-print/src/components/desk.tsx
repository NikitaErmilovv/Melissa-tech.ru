"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { countPhrase } from "@/lib/text";
import type { PrintStatus, ProductKind, PublicOrder } from "@/lib/types";
import { dayKey, formatDay } from "@/lib/time";
import { useDesk } from "./use-desk";

type DeskScope = "today" | "allDays" | "archive";

const SCOPES: { id: DeskScope; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "allDays", label: "Все дни" },
  { id: "archive", label: "Архив" },
];

const FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "waiting", label: "Ждут файлы" },
  { id: "new", label: "Новые" },
  { id: "printing", label: "В печати" },
  { id: "cancelled", label: "Отменённые" },
];

const STAMP: Record<PrintStatus, string> = {
  new: "bg-[#ffc5ee] text-black",
  printing: "bg-white text-black",
  done: "bg-[#b8e4f4] text-black",
  defect: "bg-[#ff6b3d] text-black",
  cancelled: "bg-white/10 text-white/60",
};

const STAMP_LABEL: Record<PrintStatus, string> = {
  new: "Новый",
  printing: "В печати",
  done: "Готово",
  defect: "Брак",
  cancelled: "Отменён",
};

function waiting(order: PublicOrder) {
  return order.expectedPhotos > 0 && order.files.length < order.expectedPhotos && order.printStatus !== "cancelled" && order.printStatus !== "defect" && order.printStatus !== "done";
}

function isArchived(order: PublicOrder) {
  return Boolean(order.archivedAt) || order.printStatus === "done";
}

function inScope(order: PublicOrder, scope: DeskScope, today: string) {
  if (order.source !== "wb") return false;
  if (scope === "archive") return isArchived(order);
  if (isArchived(order)) return false;
  if (scope === "today") return dayKey(order.createdAt) === today;
  return true;
}

export function Desk() {
  const { data, error } = useDesk();
  const [scope, setScope] = useState<DeskScope>("today");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const orders = data?.orders ?? [];
  const today = data ? dayKey(data.now) : "";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (!inScope(order, scope, today)) return false;
      if (filter === "waiting" && !waiting(order)) return false;
      if (filter !== "all" && filter !== "waiting" && order.printStatus !== filter) return false;
      if (!q) return true;
      return [order.wbOrderId, order.articleTitle, order.vendorCode, order.clientName].join(" ").toLowerCase().includes(q);
    });
  }, [orders, scope, filter, query, today]);

  const days = useMemo(() => groupDays(visible), [visible]);
  const stickerDays = days.filter((day) => day.kind === "sticker");
  const photoDays = days.filter((day) => day.kind === "photo");

  const activeToday = orders.filter((order) => inScope(order, "today", today));
  const stats = [
    { label: "сегодня", value: activeToday.length },
    { label: "ждут файлы", value: activeToday.filter(waiting).length },
    { label: "в печати", value: activeToday.filter((order) => order.printStatus === "printing").length },
    { label: "в архиве", value: orders.filter((order) => order.source === "wb" && isArchived(order)).length },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="sheet h-fit p-5 lg:sticky lg:top-24">
        <p className="font-heading text-[10px] font-bold tracking-[0.22em] text-[#ffc5ee] uppercase">Смена</p>
        <ul className="mt-3 space-y-3">
          {stats.map((item) => (
            <li key={item.label} className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-heading text-3xl font-black tracking-[-0.04em] leading-none">{item.value}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          3D-стикеры лежат в своей папке, отдельно от фото. Сколько макетов ждать — из карточки артикула, не из числа штук на WB.
        </p>
      </aside>

      <section>
        <h1 className="sr-only">Стол</h1>
        <div className="flex flex-col gap-3">
          <div className="flex gap-1 overflow-x-auto">
            {SCOPES.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={scope === item.id ? "default" : "outline"}
                className="h-10 shrink-0"
                onClick={() => setScope(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Номер, артикул, имя"
            className="h-10 bg-card sm:max-w-xs"
          />
          <div className="flex gap-1 overflow-x-auto">
            {FILTERS.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={filter === item.id ? "default" : "outline"}
                className="h-10 shrink-0"
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          </div>
        </div>

        {!data && !error ? <p className="mt-8 text-sm text-muted-foreground">Открываю стол…</p> : null}
        {error && !data ? <p className="mt-8 text-sm text-destructive">{error}</p> : null}
        {data && days.length === 0 ? (
          <div className="sheet mt-6 p-8">
            <p className="font-heading text-2xl font-black tracking-[-0.04em] uppercase">
              {scope === "archive" ? "В архиве пусто" : scope === "allDays" ? "Нет заказов с WB" : "Сегодня пусто"}
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {scope === "archive"
                ? "Заказы попадают сюда, когда ставите статус «Готово». Старые дни — во вкладке «Все дни»."
                : scope === "allDays"
                  ? "Здесь только живые заказы с Wildberries по всем дням. Примеры и демо на столе не показываем."
                  : "Когда покупатель сам напишет в чат WB, папка появится здесь. Старые и готовые — в «Все дни» и «Архив»."}
            </p>
            {scope === "today" ? (
              <Link href="/settings" className="mt-4 inline-block text-sm underline">
                Настройки и проверка WB
              </Link>
            ) : null}
          </div>
        ) : null}

        {days.length > 0 ? (
          <div className="mt-6 space-y-10">
            <KindBlock title="3D-стикеры" days={stickerDays} empty="Заказов на стикеры пока нет. Папка появится здесь, когда покупатель сам напишет." />
            {photoDays.length > 0 ? <KindBlock title="Фото" days={photoDays} empty="" /> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function groupDays(visible: PublicOrder[]) {
  const map = new Map<string, PublicOrder[]>();
  for (const order of visible) {
    const key = `${order.kind || "photo"}:${dayKey(order.createdAt)}`;
    map.set(key, [...(map.get(key) ?? []), order]);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, list]) => {
      const buckets = new Map<number, PublicOrder[]>();
      for (const order of list) buckets.set(order.expectedPhotos, [...(buckets.get(order.expectedPhotos) ?? []), order]);
      const sections = [...buckets.entries()].sort((a, b) => b[0] - a[0]);
      for (const [, rows] of sections) rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const kind: ProductKind = key.startsWith("sticker") ? "sticker" : "photo";
      return { key, kind, label: formatDay(list[0].createdAt), sections };
    });
}

function KindBlock({ title, days, empty }: { title: string; days: ReturnType<typeof groupDays>; empty: string }) {
  return (
    <div>
      <h2 className="font-heading text-[10px] font-bold tracking-[0.22em] text-[#ffc5ee] uppercase">{title}</h2>
      {days.length === 0 && empty ? <p className="mt-2 text-sm text-muted-foreground">{empty}</p> : null}
      <div className="mt-3 space-y-8">
        {days.map((day) => (
          <div key={day.key}>
            <h3 className="font-heading text-xl font-bold tracking-[-0.03em]">{day.label}</h3>
            {day.sections.map(([count, rows]) => (
              <div key={count} className="mt-4">
                <p className="font-heading text-[10px] font-bold tracking-[0.18em] text-white/45 uppercase">
                  {count > 0 ? countPhrase(count, day.kind) : "число не задано"} · {rows.length}
                </p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {rows.map((order) => {
                      const pct = order.expectedPhotos > 0 ? Math.min(100, Math.round((order.files.length / order.expectedPhotos) * 100)) : 0;
                      const left = Math.max(order.expectedPhotos - order.files.length, 0);
                      return (
                        <Link
                          key={order.id}
                          href={`/orders/${order.id}`}
                          className={`sheet block p-4 transition hover:-translate-y-0.5 hover:border-white/25 ${order.printStatus === "cancelled" ? "opacity-60" : ""} ${order.printStatus === "done" ? "ring-1 ring-[#b8e4f4]" : ""} ${waiting(order) ? "border-[#ffc5ee]/45" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-heading text-3xl font-black tracking-[-0.05em] leading-none">№ {order.wbOrderId}</p>
                              <p className="mt-2 text-sm">{order.articleTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.vendorCode || "без артикула"}
                                {order.clientName ? ` · ${order.clientName}` : ""}
                              </p>
                            </div>
                            <span className={`pill ${STAMP[order.printStatus]}`}>{STAMP_LABEL[order.printStatus]}</span>
                          </div>
                          <div className="mt-4 flex items-baseline justify-between text-sm">
                            <span>
                              {order.files.length} / {order.expectedPhotos || "—"}
                            </span>
                            <span className="text-muted-foreground">
                              {order.expectedPhotos > 0 && left === 0 ? (order.kind === "sticker" ? "макеты на месте" : "все фото здесь") : order.expectedPhotos > 0 ? `ещё ${left}` : "правило не задано"}
                              {order.diskUrl ? " · ссылка" : ""}
                            </span>
                          </div>
                          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-[#ffc5ee]" style={{ width: `${pct}%` }} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
    </div>
  );
}
