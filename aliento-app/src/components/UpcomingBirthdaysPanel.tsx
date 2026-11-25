import Link from "next/link";
import { Cake } from "lucide-react";
import type { UpcomingBirthday } from "@/lib/birthdays";
import { formatBirthdayDate, formatDaysUntilBirthday } from "@/lib/birthdays";
import { cn } from "@/lib/cn";

export function UpcomingBirthdaysPanel({
  birthdays,
  compact = false,
}: {
  birthdays: UpcomingBirthday[];
  compact?: boolean;
}) {
  if (birthdays.length === 0) {
    return (
      <section className="app-card">
        <div className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-accent-400" />
          <h2 className="app-card-title">Дни рождения</h2>
        </div>
        <p className="card-body mt-4 text-sm text-muted">
          В ближайшие две недели дней рождения у учеников нет.
        </p>
      </section>
    );
  }

  return (
    <section className="app-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-accent-400" />
          <h2 className="app-card-title">Скоро день рождения</h2>
        </div>
        <span className="badge badge-muted">{birthdays.length}</span>
      </div>

      <ul className={cn("mt-5 space-y-3", compact && "mt-4")}>
        {birthdays.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3",
              item.daysUntil === 0 && "border-accent-400/40 bg-accent-500/[0.08]"
            )}
          >
            <div className="min-w-0">
              <Link
                href={`/admin/students/${item.id}`}
                className="text-sm font-medium text-foreground link-underline"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-xs text-muted-dim">
                {formatBirthdayDate(item.dateOfBirth)} · {item.turnsAge} лет
                {!compact && item.phone ? ` · ${item.phone}` : ""}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-xs font-medium",
                item.daysUntil === 0 ? "text-accent-300" : "text-muted"
              )}
            >
              {formatDaysUntilBirthday(item.daysUntil)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
