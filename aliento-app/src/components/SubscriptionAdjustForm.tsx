import { SubmitButton } from "@/components/ButtonLink";
import { adjustSubscriptionHoursAction, renewSubscriptionAction } from "@/actions/admin";
import { formatHourBalance } from "@/lib/subscription-balance";

export function SubscriptionAdjustForm({
  subscription,
  studentId,
}: {
  subscription: {
    id: string;
    status: string;
    remainingClasses: number;
    totalClasses: number;
    plan: { name: string; classCount: number; durationDays: number };
  };
  studentId: string;
}) {
  const canAdjust = subscription.status === "ACTIVE" || subscription.status === "EXHAUSTED";

  if (!canAdjust) return null;

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border-strong bg-background/40 p-3">
      <p className="text-xs text-muted">
        Остаток: {formatHourBalance(subscription.remainingClasses)} из{" "}
        {formatHourBalance(subscription.totalClasses)}
      </p>
      <form action={adjustSubscriptionHoursAction} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="subscriptionId" value={subscription.id} />
        <input type="hidden" name="studentId" value={studentId} />
        <div className="min-w-[120px]">
          <label className="field-label text-xs" htmlFor={`add-${subscription.id}`}>
            Добавить часы
          </label>
          <input
            id={`add-${subscription.id}`}
            name="addHours"
            type="number"
            min={0.5}
            step={0.5}
            defaultValue={1}
            className="field"
            required
          />
        </div>
        <SubmitButton variant="secondary" size="sm">
          Начислить
        </SubmitButton>
      </form>
      <form action={renewSubscriptionAction} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="subscriptionId" value={subscription.id} />
        <input type="hidden" name="studentId" value={studentId} />
        <div className="min-w-[120px]">
          <label className="field-label text-xs" htmlFor={`extend-${subscription.id}`}>
            Продлить, дней
          </label>
          <input
            id={`extend-${subscription.id}`}
            name="extendDays"
            type="number"
            min={1}
            defaultValue={subscription.plan.durationDays}
            className="field"
            required
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-xs text-muted">
          <input type="checkbox" name="refillHours" value="1" className="size-4 rounded border-border-strong" />
          Пополнить до {formatHourBalance(subscription.plan.classCount)} (как новый тариф)
        </label>
        <SubmitButton variant="secondary" size="sm">
          Продлить
        </SubmitButton>
      </form>
    </div>
  );
}
