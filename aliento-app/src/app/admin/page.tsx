import Link from "next/link";
import { LineChartInteractive } from "@/components/charts/LineChartInteractive";
import { DonutChart, type DonutSegment } from "@/components/charts/DonutChart";
import { StatusBadge } from "@/components/StatusBadge";
import { UpcomingBirthdaysPanel } from "@/components/UpcomingBirthdaysPanel";
import { requireStaff } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { getUpcomingBirthdays } from "@/lib/birthdays";
import { syncBirthdayAdminNotifications } from "@/lib/birthday-alerts";
import { formatDateNumeric, formatRub, formatTime, isAdmin } from "@/lib/format";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function percentDelta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

const DONUT_COLORS = ["var(--accent-400)", "var(--accent-600)", "var(--accent-700)", "var(--muted-dim)"];

export default async function AdminDashboard() {
  const user = await requireStaff();
  const staffIsAdmin = isAdmin(user.role);

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrow = new Date(todayStart.getTime() + 86_400_000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [todayClasses, attendances, subscriptions, payments, students] = await Promise.all([
    prisma.danceClass.findMany({
      where: {
        startsAt: { gte: todayStart, lt: tomorrow },
        ...(staffIsAdmin ? {} : { teacher: { userId: user.id } }),
      },
      include: { bookings: { where: { status: "BOOKED" } } },
    }),
    prisma.attendance.findMany(),
    prisma.subscription.findMany(),
    prisma.payment.findMany({ where: { status: "PAID" } }),
    prisma.user.findMany({ where: { role: "STUDENT" } }),
  ]);

  const upcomingBirthdays = getUpcomingBirthdays(students);
  if (staffIsAdmin) {
    await syncBirthdayAdminNotifications();
  }

  const presentAll = attendances.filter((a) => a.status === "PRESENT");
  const presentThisMonth = presentAll.filter((a) => a.createdAt >= monthStart).length;
  const presentPrevMonth = presentAll.filter(
    (a) => a.createdAt >= prevMonthStart && a.createdAt < monthStart
  ).length;

  const revenueThisMonth = payments
    .filter((p) => p.createdAt >= monthStart)
    .reduce((sum, p) => sum + p.amountRub, 0);
  const revenuePrevMonth = payments
    .filter((p) => p.createdAt >= prevMonthStart && p.createdAt < monthStart)
    .reduce((sum, p) => sum + p.amountRub, 0);

  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const newSubsThisMonth = activeSubs.filter((s) => s.createdAt >= monthStart).length;
  const newStudentsThisMonth = students.filter((s) => s.createdAt >= monthStart).length;

  const series = Array.from({ length: 30 }).map((_, index) => {
    const day = new Date(todayStart.getTime() - (29 - index) * 86_400_000);
    const next = new Date(day.getTime() + 86_400_000);
    const value = presentAll.filter((a) => a.createdAt >= day && a.createdAt < next).length;
    return {
      label: String(day.getDate()),
      value,
      date: day.toISOString().slice(0, 10),
    };
  });

  const byPlan = new Map<string, number>();
  for (const sub of activeSubs) {
    byPlan.set(sub.plan.name, (byPlan.get(sub.plan.name) ?? 0) + 1);
  }
  const donut: DonutSegment[] = [...byPlan.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({
      label,
      value,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
    }));

  const recentPayments = await prisma.payment.findMany({ take: 5 });

  const kpis = staffIsAdmin
    ? [
        {
          label: "Всего учеников",
          value: String(students.length),
          delta: `+${newStudentsThisMonth} за месяц`,
        },
        {
          label: "Посещено занятий",
          value: String(presentThisMonth),
          delta: `${percentDelta(presentThisMonth, presentPrevMonth) >= 0 ? "+" : ""}${percentDelta(presentThisMonth, presentPrevMonth)}% к прошлому месяцу`,
        },
        {
          label: "Выручка за месяц",
          value: formatRub(revenueThisMonth),
          delta: `${percentDelta(revenueThisMonth, revenuePrevMonth) >= 0 ? "+" : ""}${percentDelta(revenueThisMonth, revenuePrevMonth)}% к прошлому месяцу`,
        },
        {
          label: "Активные абонементы",
          value: String(activeSubs.length),
          delta: `+${newSubsThisMonth} новых`,
        },
      ]
    : [
        { label: "Занятий сегодня", value: String(todayClasses.length), delta: "по вашему расписанию" },
        {
          label: "Записей на сегодня",
          value: String(todayClasses.reduce((sum, c) => sum + c.bookings.length, 0)),
          delta: "ждём на занятии",
        },
      ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl md:text-3xl">Панель управления</h1>
        <p className="text-sm text-muted" suppressHydrationWarning>
          {formatDateNumeric(now)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="app-card">
            <p className="stat-label">{kpi.label}</p>
            <p className="stat-value">{kpi.value}</p>
            <p className="stat-delta">{kpi.delta}</p>
          </div>
        ))}
      </div>

      {staffIsAdmin && upcomingBirthdays.length > 0 && (
        <UpcomingBirthdaysPanel birthdays={upcomingBirthdays} compact />
      )}

      {staffIsAdmin && (
        <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
          <section className="app-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="app-card-title">Посещаемость занятий</h2>
              <span className="badge badge-muted">Последние 30 дней · нажмите на день</span>
            </div>
            <div className="mt-6">
              <LineChartInteractive points={series} />
            </div>
          </section>

          <section className="app-card">
            <h2 className="app-card-title">Абонементы</h2>
            <div className="mt-6">
              <DonutChart segments={donut} />
            </div>
          </section>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {staffIsAdmin && (
          <section className="app-card">
            <div className="flex items-center justify-between gap-4">
              <h2 className="app-card-title">Все ученики школы</h2>
              <Link href="/admin/students" className="text-sm text-accent-300 link-underline">
                Управление учениками
              </Link>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="data-table min-w-[440px]">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Телефон</th>
                    <th className="text-right">Абонемент</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-muted">
                        Учеников пока нет.
                      </td>
                    </tr>
                  )}
                  {students.map((student) => {
                    const active = student.subscriptions.find((s) => s.status === "ACTIVE");
                    return (
                      <tr key={student.id}>
                        <td>
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="text-foreground link-underline"
                          >
                            {student.name}
                          </Link>
                        </td>
                        <td>{student.phone}</td>
                        <td className="text-right">
                          {active ? (
                            <span className="text-accent-300">{active.plan.name}</span>
                          ) : (
                            <span className="text-muted-dim">Нет</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="app-card">
          <div className="flex items-center justify-between gap-4">
            <h2 className="app-card-title">Занятия на сегодня</h2>
            <Link href="/admin/schedule" className="text-sm text-accent-300 link-underline">
              Расписание
            </Link>
          </div>
          {todayClasses.length === 0 ? (
            <p className="card-body mt-5 text-sm">На сегодня занятий нет.</p>
          ) : (
            <ul className="mt-5 divide-y divide-border">
              {todayClasses.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3.5">
                  <span className="w-14 shrink-0 text-sm text-accent-300">
                    {formatTime(item.startsAt)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-dim">
                      {item.room} · {item.teacher.user.name}
                    </p>
                  </div>
                  <span className="text-sm text-muted">
                    {item.bookings.length}/{item.capacity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {staffIsAdmin && (
        <section className="app-card">
          <div className="flex items-center justify-between gap-4">
            <h2 className="app-card-title">Последние платежи</h2>
            <Link href="/admin/payments" className="text-sm text-accent-300 link-underline">
              Все платежи
            </Link>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="data-table min-w-[640px]">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Ученик</th>
                  <th>Описание</th>
                  <th>Сумма</th>
                  <th className="text-right">Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDateNumeric(payment.createdAt)}</td>
                    <td className="text-foreground">{payment.user.name}</td>
                    <td>{payment.purpose}</td>
                    <td>{formatRub(payment.amountRub)}</td>
                    <td className="text-right">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
