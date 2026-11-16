"use client";

import { useRouter } from "next/navigation";
import { LineChart, type LinePoint } from "./LineChart";

export type InteractiveLinePoint = LinePoint & { date?: string };

export function LineChartInteractive({
  points,
  highlightLabel = "Пик",
}: {
  points: InteractiveLinePoint[];
  highlightLabel?: string;
}) {
  const router = useRouter();

  return (
    <div className="relative">
      <LineChart points={points} highlightLabel={highlightLabel} />
      <div className="pointer-events-none absolute inset-0 flex items-stretch">
        {points.map((point, index) => (
          <button
            key={`${point.label}-${index}`}
            type="button"
            title={point.date ? `Открыть ${point.date}` : undefined}
            aria-label={point.date ? `Расписание на ${point.date}` : `День ${point.label}`}
            onClick={() => {
              if (point.date) router.push(`/admin/schedule?date=${point.date}`);
            }}
            className="pointer-events-auto flex-1 cursor-pointer border-0 bg-transparent transition-colors hover:bg-accent-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400"
          />
        ))}
      </div>
    </div>
  );
}
