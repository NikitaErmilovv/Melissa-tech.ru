import { SubmitButton } from "@/components/ButtonLink";
import { StatusBadge } from "@/components/StatusBadge";
import { SubscriptionAdminActions } from "@/components/SubscriptionAdminActions";
import { requireStaff } from "@/actions/auth";
import { createPlanAction, deletePlanAction, togglePlanPopularAction } from "@/actions/admin";
import { prisma } from "@/lib/db";
import { formatDate, formatRub, isAdmin } from "@/lib/format";

export default async function AdminPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; deleted?: string }>;
}) {
  const user = await requireStaff();
  if (!isAdmin(user.role)) {
    return <p className="app-card card-body text-sm">Раздел доступен администраторам школы.</p>;
  }

  const { error, created, deleted } = await searchParams;
  const [plans, subscriptions] = await Promise.all([
    prisma.plan.findMany(),
    prisma.subscription.findMany(),
  ]);

  const active = subscriptions.filter((s) => s.status === "ACTIVE");
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
    if (b.status === "ACTIVE" && a.status !== "ACTIVE") return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  const countByPlan = new Map<string, number>();
  for (const sub of active) {
    countByPlan.set(sub.planId, (countByPlan.get(sub.planId) ?? 0) + 1);
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl md:text-3xl">Абонементы</h1>

      {error && <p className="app-card border-danger/40 text-sm text-danger">{error}</p>}
      {created && <p className="app-card text-sm text-success">Тариф создан.</p>}
      {deleted && <p className="app-card text-sm text-muted">Тариф удалён.</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="app-card">
          <p className="stat-label">Тарифов</p>
          <p className="stat-value">{plans.length}</p>
        </div>
        <div className="app-card">
          <p className="stat-label">Активных абонементов</p>
          <p className="stat-value">{active.length}</p>
        </div>
        <div className="app-card">
          <p className="stat-label">Завершённых</p>
          <p className="stat-value">{subscriptions.length - active.length}</p>
        </div>
      </div>

      <section className="app-card">
        <h2 className="app-card-title">Тарифы школы</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table min-w-[760px]">
            <thead>
              <tr>
                <th>Название</th>
                <th>Часов</th>
                <th>Срок</th>
                <th>Цена</th>
                <th>Активных</th>
                <th className="text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <p className="text-foreground">{plan.name}</p>
                    <p className="mt-1 text-xs text-muted-dim">{plan.description}</p>
                  </td>
                  <td>{plan.classCount}</td>
                  <td>{plan.durationDays} дн.</td>
                  <td>{formatRub(plan.priceRub)}</td>
                  <td>{countByPlan.get(plan.id) ?? 0}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <form action={togglePlanPopularAction}>
                        <input type="hidden" name="planId" value={plan.id} />
                        <SubmitButton variant="secondary" size="sm">
                          {plan.popular ? "Снять «Популярный»" : "Сделать популярным"}
                        </SubmitButton>
                      </form>
                      <form action={deletePlanAction}>
                        <input type="hidden" name="planId" value={plan.id} />
                        <SubmitButton variant="ghost" size="sm">
                          Удалить
                        </SubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="app-card">
        <h2 className="app-card-title">Новый тариф</h2>
        <form action={createPlanAction} className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="field-label" htmlFor="name">
              Название
            </label>
            <input id="name" name="name" required className="field" placeholder="Абонемент 12 занятий" />
          </div>
          <div>
            <label className="field-label" htmlFor="classCount">
              Часов в абонементе
            </label>
            <input id="classCount" name="classCount" type="number" min={0.5} step={0.5} defaultValue={8} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="durationDays">
              Срок, дней
            </label>
            <input id="durationDays" name="durationDays" type="number" min={1} defaultValue={45} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="priceRub">
              Цена, ₽
            </label>
            <input id="priceRub" name="priceRub" type="number" min={0} step={100} defaultValue={9000} className="field" />
          </div>
          <div className="md:col-span-3">
            <label className="field-label" htmlFor="description">
              Описание
            </label>
            <input id="description" name="description" className="field" placeholder="Действует 45 дней." />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <input id="popular" name="popular" type="checkbox" className="h-4 w-4 accent-[var(--accent-500)]" />
            <label htmlFor="popular" className="text-sm text-muted">
              Отметить как популярный
            </label>
          </div>
          <div className="flex items-end md:col-span-2 md:justify-end">
            <SubmitButton>Создать тариф</SubmitButton>
          </div>
        </form>
      </section>

      <section className="app-card">
        <h2 className="app-card-title">Абонементы учеников</h2>
        <p className="mt-2 text-sm text-muted">
          Деактивируйте ошибочный абонемент или удалите запись полностью.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table min-w-[820px]">
            <thead>
              <tr>
                <th>Ученик</th>
                <th>Тариф</th>
                <th>Остаток</th>
                <th>Действует до</th>
                <th className="text-right">Статус</th>
                <th className="text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubscriptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">
                    Абонементов пока нет.
                  </td>
                </tr>
              )}
              {sortedSubscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="text-foreground">{sub.user.name}</td>
                  <td>{sub.plan.name}</td>
                  <td>
                    {sub.remainingClasses} из {sub.totalClasses}
                  </td>
                  <td>{formatDate(sub.expiresAt)}</td>
                  <td className="text-right">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="text-right">
                    <SubscriptionAdminActions
                      subscriptionId={sub.id}
                      status={sub.status}
                      studentId={sub.userId}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
