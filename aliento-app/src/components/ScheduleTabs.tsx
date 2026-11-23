"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export type ScheduleRow = {
  id: string;
  time: string;
  title: string;
  level: string;
  room: string;
  teacher: string;
};

export type ScheduleDay = {
  key: string;
  label: string;
  short: string;
  rows: ScheduleRow[];
};

export function ScheduleTabs({
  days,
  emptyLabel = "В этот день занятий нет.",
}: {
  days: ScheduleDay[];
  emptyLabel?: string;
}) {
  const firstFilled = days.find((day) => day.rows.length > 0) ?? days[0];
  const [active, setActive] = useState(firstFilled?.key);
  const current = days.find((day) => day.key === active) ?? firstFilled;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {days.map((day) => (
          <button
            key={day.key}
            type="button"
            onClick={() => setActive(day.key)}
            className={cn("tab-link", day.key === current?.key && "tab-link-active")}
          >
            <span className="hidden sm:inline">{day.label}</span>
            <span className="sm:hidden">{day.short}</span>
          </button>
        ))}
      </div>

      <ul className="mt-6 divide-y divide-border">
        {current?.rows.length === 0 && (
          <li className="py-4 text-sm text-muted">{emptyLabel}</li>
        )}
        {current?.rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4">
            <span className="w-28 shrink-0 text-sm text-accent-300">{row.time}</span>
            <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{row.title}</span>
            <span className="text-xs text-muted-dim">{row.level}</span>
            <span className="w-16 text-right text-xs text-muted">{row.room}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
