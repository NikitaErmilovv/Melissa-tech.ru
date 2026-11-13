import { StatusBadge } from "@/components/StatusBadge";
import {
  formatHoursRatio,
  pickStudentListSubscription,
  type StudentSubscriptionRow,
} from "@/lib/subscription-balance";

export function StudentListSubscription({ subscriptions }: { subscriptions: StudentSubscriptionRow[] }) {
  const sub = pickStudentListSubscription(subscriptions);

  if (!sub) {
    return (
      <div className="space-y-1">
        <StatusBadge status="CANCELLED" label="Нет абонемента" />
        <p className="text-xs text-muted-dim">— / —</p>
      </div>
    );
  }

  const expired = sub.expiresAt.getTime() < Date.now();
  const exhausted = sub.remainingClasses <= 0 || sub.status === "EXHAUSTED";
  const active = sub.status === "ACTIVE" && !expired && !exhausted;

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">{sub.plan.name}</p>
      <div className="flex flex-wrap items-center gap-2">
        {active ? (
          <StatusBadge status="ACTIVE" label="Есть абонемент" />
        ) : exhausted ? (
          <StatusBadge status="EXHAUSTED" label="Часы закончились" />
        ) : expired ? (
          <StatusBadge status="EXPIRED" label="Срок истёк" />
        ) : (
          <StatusBadge status="ACTIVE" />
        )}
        <span
          className={
            active
              ? "font-display text-base text-foreground tabular-nums"
              : "text-sm text-muted tabular-nums"
          }
        >
          {formatHoursRatio(sub.remainingClasses, sub.totalClasses)}
        </span>
      </div>
    </div>
  );
}
