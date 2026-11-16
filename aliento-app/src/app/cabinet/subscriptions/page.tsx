import { StatusBadge } from "@/components/StatusBadge";
import { requireStudent } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { formatHourBalance } from "@/lib/subscription-balance";
import { cn } from "@/lib/cn";

export default async function CabinetSubscriptionsPage() {
  const user = await requireStudent();
  const items = await prisma.subscription.findMany({ where: { userId: user.id } });
  const active = items.filter((s) => s.status === "ACTIVE");
  const past = items.filter((s) => s.status !== "ACTIVE");

  return (
    <div className="grid gap-5">
      <section className="app-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="app-card-title">Мои абонементы</h2>
        </div>
        <p className="mt-3 text-sm text-muted">
          Абонементы выдаёт школа после оплаты. Если нужно продлить или купить часы — напишите
          администратору или преподавателю.
        </p>

        {active.length === 0 ? (
          <p className="card-body mt-5 text-sm">Активных абонементов нет — обратитесь в школу.</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {active.map((sub) => {
              const ratio =
                sub.totalClasses > 0
                  ? Math.round((sub.remainingClasses / sub.totalClasses) * 100)
                  : 0;
              return (
                <article
                  key={sub.id}
                  className={cn("rounded-2xl border border-border-strong bg-accent-500/[0.07] p-5")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{sub.plan.name}</p>
                      <p className="mt-1 text-xs text-muted">Выдано школой</p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Осталось часов</span>
                      <span className="text-foreground">
                        {formatHourBalance(sub.remainingClasses)} из{" "}
                        {formatHourBalance(sub.totalClasses)}
                      </span>
                    </div>
                    <div className="progress-track mt-2.5">
                      <div className="progress-fill" style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-muted">
                    Действует до <span className="text-foreground">{formatDate(sub.expiresAt)}</span>
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="app-card">
        <h2 className="app-card-title">История абонементов</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table min-w-[600px]">
            <thead>
              <tr>
                <th>Абонемент</th>
                <th>Часы</th>
                <th>Выдан</th>
                <th>Действовал до</th>
                <th className="text-right">Статус</th>
              </tr>
            </thead>
            <tbody>
              {past.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">
                    Прошлых абонементов нет.
                  </td>
                </tr>
              )}
              {past.map((sub) => (
                <tr key={sub.id}>
                  <td className="text-foreground">{sub.plan.name}</td>
                  <td>
                    {formatHourBalance(sub.totalClasses - sub.remainingClasses)} использовано из{" "}
                    {formatHourBalance(sub.totalClasses)}
                  </td>
                  <td>{formatDate(sub.createdAt)}</td>
                  <td>{formatDate(sub.expiresAt)}</td>
                  <td className="text-right">
                    <StatusBadge status={sub.status} />
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
