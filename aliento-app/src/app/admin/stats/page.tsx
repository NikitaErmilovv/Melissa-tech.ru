import { LineChart, type LinePoint } from "@/components/charts/LineChart";
import { DonutChart, type DonutSegment } from "@/components/charts/DonutChart";
import { requireStaff } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { formatRub, isAdmin, plural } from "@/lib/format";

const MONTH_SHORT = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const DONUT_COLORS = ["var(--accent-400)", "var(--accent-600)", "var(--accent-700)", "var(--muted-dim)"];

export default async function AdminStatsPage() {
  const user = await requireStaff();
  if (!isAdmin(user.role)) {
    return <p className="app-card card-body text-sm">Раздел доступен администраторам школы.</p>;
  }

  const now = new Date();
  const [students, attendances, payments, classes, bookings] = await Promise.all([
    prisma.user.findMany({ where: { role: "STUDENT" } }),
    prisma.attendance.findMany(),
    prisma.payment.findMany({ where: { status: "PAID" } }),
    prisma.danceClass.findMany(),
    prisma.booking.findMany(),
  ]);

  const present = attendances.filter((a) => a.status === "PRESENT");
  const absent = attendances.filter((a) => a.status === "ABSENT");
  const attendanceRate =
    attendances.length > 0 ? Math.round((present.length / attendances.length) * 100) : 0;

  // Revenue per month for the last six months.
  const revenueSeries: LinePoint[] = Array.from({ length: 6 }).map((_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
    const value = payments
      .filter((p) => p.createdAt >= monthDate && p.createdAt < nextMonth)
      .reduce((sum, p) => sum + p.amountRub, 0);
    return { label: MONTH_SHORT[monthDate.getMonth()], value: Math.round(value / 1000) };
  });

  // Class popularity by booking volume.
  const popularity = new Map<string, number>();
  for (const booking of bookings) {
    if (booking.status !== "BOOKED") continue;
    popularity.set(booking.class.title, (popularity.get(booking.class.title) ?? 0) + 1);
  }
  const popular = [...popularity.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxPopular = popular[0]?.[1] ?? 1;

  // Retention: students with at least one visit in the trailing 30 days.
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000);
  const activeStudentIds = new Set(present.filter((a) => a.createdAt >= monthAgo).map((a) => a.userId));
  const retention =
    students.length > 0 ? Math.round((activeStudentIds.size / students.length) * 100) : 0;

  const levelCount = new Map<string, number>();
  for (const item of classes) {
    levelCount.set(item.level, (levelCount.get(item.level) ?? 0) + 1);
  }
  const levels: DonutSegment[] = [...levelCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({
      label,
      value,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
    }));

  const totalRevenue = payments.reduce((sum, p) => sum + p.amountRub, 0);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl md:text-3xl">Статистика</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="app-card">
          <p className="stat-label">Посещаемость</p>
          <p className="stat-value">{attendanceRate}%</p>
          <p className="stat-delta">
            {present.length} {plural(present.length, ["посещение", "посещения", "посещений"])},{" "}
            {absent.length} {plural(absent.length, ["пропуск", "пропуска", "пропусков"])}
          </p>
        </div>
        <div className="app-card">
          <p className="stat-label">Общая выручка</p>
          <p className="stat-value">{formatRub(totalRevenue)}</p>
        </div>
        <div className="app-card">
          <p className="stat-label">Удержание за 30 дней</p>
          <p className="stat-value">{retention}%</p>
          <p className="stat-delta">
            {activeStudentIds.size} из {students.length} учеников
          </p>
        </div>
        <div className="app-card">
          <p className="stat-label">Занятий в базе</p>
          <p className="stat-value">{classes.length}</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <section className="app-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="app-card-title">Выручка по месяцам</h2>
            <span className="badge badge-muted">тыс. ₽</span>
          </div>
          <div className="mt-6">
            <LineChart points={revenueSeries} highlightLabel="Максимум" />
          </div>
        </section>

        <section className="app-card">
          <h2 className="app-card-title">Занятия по уровням</h2>
          <div className="mt-6">
            <DonutChart segments={levels} />
          </div>
        </section>
      </div>

      <section className="app-card">
        <h2 className="app-card-title">Популярность занятий</h2>
        {popular.length === 0 ? (
          <p className="card-body mt-5 text-sm">Пока нет записей на занятия.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {popular.map(([title, count]) => (
              <li key={title}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-foreground">{title}</span>
                  <span className="text-muted">
                    {count} {plural(count, ["запись", "записи", "записей"])}
                  </span>
                </div>
                <div className="progress-track mt-2">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.round((count / maxPopular) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
