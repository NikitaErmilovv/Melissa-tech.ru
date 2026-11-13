"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

export function ScheduleDatePicker({ selected }: { selected: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const selectedDate = new Date(`${selected}T12:00:00`);
  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay() + 1);

  const days = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + index);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric" });
    return { iso, label, active: iso === selected };
  });

  function shift(daysOffset: number) {
    const d = new Date(`${selected}T12:00:00`);
    d.setDate(d.getDate() + daysOffset);
    const next = new URLSearchParams(params.toString());
    next.set("date", d.toISOString().slice(0, 10));
    router.push(`/admin/schedule?${next.toString()}`);
  }

  return (
    <div className="app-card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="app-card-title">Выберите дату</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shift(-7)} className="btn btn-secondary btn-sm">
            ← Неделя
          </button>
          <input
            type="date"
            value={selected}
            onChange={(e) => {
              const next = new URLSearchParams(params.toString());
              next.set("date", e.target.value);
              router.push(`/admin/schedule?${next.toString()}`);
            }}
            className="field !mt-0 w-auto"
          />
          <button type="button" onClick={() => shift(7)} className="btn btn-secondary btn-sm">
            Неделя →
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {days.map((day) => (
          <Link
            key={day.iso}
            href={`/admin/schedule?date=${day.iso}`}
            className={cn("tab-link capitalize", day.active && "tab-link-active")}
          >
            {day.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
