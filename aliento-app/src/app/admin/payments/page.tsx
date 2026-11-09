import { SubmitButton } from "@/components/ButtonLink";
import { StatusBadge } from "@/components/StatusBadge";
import { requireStaff } from "@/actions/auth";
import { confirmPaymentAction } from "@/actions/admin";
import { prisma } from "@/lib/db";
import { formatDateNumeric, formatRub, isAdmin } from "@/lib/format";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; error?: string }>;
}) {
  const user = await requireStaff();
  if (!isAdmin(user.role)) {
    return <p className="app-card card-body text-sm">Раздел доступен администраторам школы.</p>;
  }

  const { confirmed, error } = await searchParams;
  const payments = await prisma.payment.findMany();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const paid = payments.filter((p) => p.status === "PAID");
  const monthRevenue = paid
    .filter((p) => p.createdAt >= monthStart)
    .reduce((sum, p) => sum + p.amountRub, 0);
  const pending = payments.filter((p) => p.status === "PENDING");

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl md:text-3xl">Платежи</h1>

      {error && <p className="app-card border-danger/40 text-sm text-danger">{error}</p>}
      {confirmed && <p className="app-card text-sm text-success">Платёж отмечен как оплаченный.</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="app-card">
          <p className="stat-label">Выручка за месяц</p>
          <p className="stat-value">{formatRub(monthRevenue)}</p>
        </div>
        <div className="app-card">
          <p className="stat-label">Всего платежей</p>
          <p className="stat-value">{payments.length}</p>
        </div>
        <div className="app-card">
          <p className="stat-label">Ожидают оплаты</p>
          <p className="stat-value">{pending.length}</p>
        </div>
      </div>

      <section className="app-card">
        <h2 className="app-card-title">Все транзакции</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table min-w-[760px]">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Ученик</th>
                <th>Описание</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th className="text-right">Действие</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">
                    Платежей нет.
                  </td>
                </tr>
              )}
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDateNumeric(payment.createdAt)}</td>
                  <td className="text-foreground">{payment.user.name}</td>
                  <td>{payment.purpose}</td>
                  <td>{formatRub(payment.amountRub)}</td>
                  <td>
                    <StatusBadge status={payment.status} />
                  </td>
                  <td>
                    <div className="flex justify-end">
                      {payment.status === "PENDING" ? (
                        <form action={confirmPaymentAction}>
                          <input type="hidden" name="paymentId" value={payment.id} />
                          <SubmitButton variant="secondary" size="sm">
                            Отметить оплаченным
                          </SubmitButton>
                        </form>
                      ) : (
                        <span className="text-xs text-muted-dim">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-xs text-muted-dim">
          Онлайн-оплата проходит через ЮKassa. Статус платежа обновляется автоматически после
          подтверждения от платёжной системы.
        </p>
      </section>
    </div>
  );
}
