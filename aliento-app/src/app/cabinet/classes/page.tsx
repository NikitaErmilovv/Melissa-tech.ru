import { StatusBadge } from "@/components/StatusBadge";
import { requireStudent } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatDateNumeric, formatTime } from "@/lib/format";
import { filterClassesWithinDays } from "@/lib/schedule";

export default async function CabinetClassesPage() {
  const user = await requireStudent();
  const now = new Date();

  const [upcomingClasses, attendances] = await Promise.all([
    prisma.danceClass.findMany({
      where: { startsAt: { gte: now } },
      include: { teacher: { include: { user: true } } },
    }),
    prisma.attendance.findMany({ where: { userId: user.id } }),
  ]);

  const schedule = filterClassesWithinDays(upcomingClasses, 14).sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime()
  );

  const history = attendances
    .filter((a) => a.class.startsAt < now)
    .sort((a, b) => b.class.startsAt.getTime() - a.class.startsAt.getTime())
    .slice(0, 30);

  return (
    <div className="grid gap-5">
      <section className="app-card">
        <h2 className="app-card-title">Ближайшие занятия</h2>
        <p className="mt-2 text-sm text-muted">
          Расписание школы на две недели. Запись не нужна — просто приходите на занятие.
        </p>

        {schedule.length === 0 ? (
          <p className="card-body mt-5 text-sm">В ближайшие две недели занятий в расписании нет.</p>
        ) : (
          <ul className="mt-5 divide-y divide-border">
            {schedule.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 py-4">
                <div className="w-40 shrink-0">
                  <p className="text-sm text-accent-300">{formatDate(item.startsAt)}</p>
                  <p className="mt-1 text-xs text-muted-dim">
                    {formatTime(item.startsAt)} — {formatTime(item.endsAt)}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {item.teacher.user.name} · {item.room} · {item.level}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="app-card">
        <h2 className="app-card-title">Моя история посещений</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table min-w-[640px]">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Занятие</th>
                <th>Преподаватель</th>
                <th>Зал</th>
                <th className="text-right">Статус</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">
                    Посещений пока нет — они появятся, когда преподаватель отметит вас на занятии.
                  </td>
                </tr>
              )}
              {history.map((row) => (
                <tr key={row.id}>
                  <td>{formatDateNumeric(row.class.startsAt)}</td>
                  <td className="text-foreground">{row.class.title}</td>
                  <td>{row.class.teacher.user.name}</td>
                  <td>{row.class.room}</td>
                  <td className="text-right">
                    <StatusBadge status={row.status} />
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
