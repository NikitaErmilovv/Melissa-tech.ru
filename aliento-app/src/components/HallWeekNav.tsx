"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, isoDate, startOfWeek } from "@/lib/hall-grid";

export function HallWeekNav({
  weekStartIso,
  basePath = "/admin/halls",
}: {
  weekStartIso: string;
  basePath?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const weekStart = new Date(`${weekStartIso}T12:00:00`);
  const prev = isoDate(addDays(weekStart, -7));
  const next = isoDate(addDays(weekStart, 7));
  const todayWeek = isoDate(startOfWeek(new Date()));

  function weekHref(iso: string) {
    const nextParams = new URLSearchParams(params.toString());
    nextParams.set("week", iso);
    return `${basePath}?${nextParams.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={weekHref(prev)} className="btn btn-secondary btn-sm">
        ← Неделя
      </Link>
      <input
        type="week"
        className="field !mt-0 w-auto"
        value={`${weekStart.getFullYear()}-W${String(getWeekNumber(weekStart)).padStart(2, "0")}`}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) return;
          const [year, weekPart] = value.split("-W");
          const week = Number(weekPart);
          const jan4 = new Date(Number(year), 0, 4);
          const start = startOfWeek(jan4);
          start.setDate(start.getDate() + (week - 1) * 7);
          const nextParams = new URLSearchParams(params.toString());
          nextParams.set("week", isoDate(start));
          router.push(`${basePath}?${nextParams.toString()}`);
        }}
      />
      <Link href={weekHref(next)} className="btn btn-secondary btn-sm">
        Неделя →
      </Link>
      {weekStartIso !== todayWeek && (
        <Link href={weekHref(todayWeek)} className="btn btn-ghost btn-sm">
          Текущая неделя
        </Link>
      )}
    </div>
  );
}

function getWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}
