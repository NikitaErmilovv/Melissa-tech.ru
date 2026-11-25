import { ButtonLink } from "./ButtonLink";
import { formatClassCount, formatRub } from "@/lib/format";
import { cn } from "@/lib/cn";

export type PricingPlan = {
  id: string;
  name: string;
  priceRub: number;
  classCount: number;
  durationDays: number;
  popular: boolean;
  description: string;
};

export function PricingCards({
  plans,
  columns = 3,
  renderAction,
}: {
  plans: PricingPlan[];
  columns?: 1 | 3;
  renderAction?: (plan: PricingPlan) => React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-5 md:gap-6",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 1 && "mx-auto max-w-lg"
      )}
    >
      {plans.map((plan) => (
        <article
          key={plan.id}
          className={cn(
            "content-panel flex flex-col",
            plan.popular ? "content-panel-highlight" : "content-panel-interactive"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-base font-medium leading-snug text-foreground">
              {plan.name}
            </h3>
            {plan.popular && <span className="badge badge-accent shrink-0">Популярный</span>}
          </div>

          <p className="mt-4 font-display text-3xl font-medium leading-none text-accent-300 md:text-4xl">
            {formatRub(plan.priceRub)}
          </p>

          <p className="card-body mt-3 text-sm">{plan.description}</p>

          <p className="label-caps mt-2">
            {formatClassCount(plan.classCount)} · {plan.durationDays} дней
          </p>

          <div className="panel-divider mt-5 flex flex-wrap items-center gap-2">
            {renderAction?.(plan) ?? (
              <ButtonLink
                href="/subscriptions"
                size="sm"
                variant={plan.popular ? "primary" : "secondary"}
              >
                Выбрать
              </ButtonLink>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
