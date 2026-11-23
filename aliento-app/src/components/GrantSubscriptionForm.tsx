import { SubmitButton } from "@/components/ButtonLink";
import { grantSubscriptionAction } from "@/actions/admin";
import type { Plan } from "@/lib/db";

export function GrantSubscriptionForm({
  studentId,
  plans,
}: {
  studentId: string;
  plans: Plan[];
}) {
  if (plans.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted">
        Сначала создайте тариф в разделе{" "}
        <a href="/admin/plans" className="text-accent-300 link-underline">
          Абонементы
        </a>
        .
      </p>
    );
  }

  return (
    <form action={grantSubscriptionAction} className="mt-4 flex flex-wrap items-end gap-3">
      <input type="hidden" name="studentId" value={studentId} />
      <div className="min-w-[200px] flex-1">
        <label className="field-label" htmlFor={`plan-${studentId}`}>
          Выдать абонемент
        </label>
        <select id={`plan-${studentId}`} name="planId" className="field" required defaultValue={plans[0]?.id}>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} ({plan.classCount} ч, {plan.priceRub} ₽)
            </option>
          ))}
        </select>
      </div>
      <SubmitButton className="btn-primary">Выдать ученику</SubmitButton>
    </form>
  );
}
