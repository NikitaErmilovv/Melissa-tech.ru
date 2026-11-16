import Link from "next/link";
import { SubmitButton } from "@/components/ButtonLink";
import { requireStaff } from "@/actions/auth";
import { createClassAction, deleteClassAction } from "@/actions/admin";
import { prisma } from "@/lib/db";
import { formatDate, formatTime, isAdmin } from "@/lib/format";

export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; deleted?: string; count?: string }>;
}) {
  const user = await requireStaff();
  const staffIsAdmin = isAdmin(user.role);
  const { error, created, deleted, count } = await searchParams;

  const weekdayLabels = [
    { value: 1, label: "Пн" },
    { value: 2, label: "Вт" },
    { value: 3, label: "Ср" },
    { value: 4, label: "Чт" },
    { value: 5, label: "Пт" },
    { value: 6, label: "Сб" },
    { value: 0, label: "Вс" },
  ];

  const now = new Date();
  const [classes, teachers] = await Promise.all([
    prisma.danceClass.findMany({
      where: {
        startsAt: { gte: new Date(now.getTime() - 7 * 86_400_000) },
        ...(staffIsAdmin ? {} : { teacher: { userId: user.id } }),
      },
    }),
    prisma.teacher.findMany(),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl md:text-3xl">
        {staffIsAdmin ? "Занятия" : "Мои занятия"}
      </h1>

      {error && <p className="app-card border-danger/40 text-sm text-danger">{error}</p>}
      {created && (
        <p className="app-card text-sm text-success">
          {count ? `Добавлено занятий в расписание: ${count}.` : "Занятие добавлено в расписание."}
        </p>
      )}
      {deleted && <p className="app-card text-sm text-muted">Занятие удалено.</p>}

      {staffIsAdmin && (
        <section className="app-card">
          <h2 className="app-card-title">Создать занятие</h2>
          <form action={createClassAction} className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="field-label" htmlFor="title">
                Название
              </label>
              <input id="title" name="title" required className="field" placeholder="Bachata Sensual" />
            </div>
            <div>
              <label className="field-label" htmlFor="level">
                Уровень
              </label>
              <select id="level" name="level" className="field" defaultValue="Начальный уровень">
                <option>Начальный уровень</option>
                <option>Средний уровень</option>
                <option>Продолжающие</option>
                <option>Все уровни</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="teacherId">
                Преподаватель
              </label>
              <select id="teacherId" name="teacherId" className="field" required>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="date">
                Дата (неделя отсчёта)
              </label>
              <input id="date" name="date" type="date" required className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="time">
                Время
              </label>
              <input id="time" name="time" type="time" required className="field" defaultValue="19:00" />
            </div>
            <div>
              <label className="field-label" htmlFor="duration">
                Длительность, мин
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                min={30}
                step={15}
                defaultValue={90}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="room">
                Зал
              </label>
              <input id="room" name="room" required className="field" defaultValue="Зал 1" />
            </div>
            <div>
              <label className="field-label" htmlFor="capacity">
                Мест
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                defaultValue={20}
                className="field"
              />
            </div>
            <div className="md:col-span-3">
              <p className="field-label">Повтор по дням недели</p>
              <p className="mt-1 text-xs text-muted">
                Отметьте дни — занятие создастся на каждую выбранную неделю вперёд. Без галочек — одно
                занятие на указанную дату.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {weekdayLabels.map((day) => (
                  <label
                    key={day.value}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm has-[:checked]:border-accent-400 has-[:checked]:bg-accent-400/10"
                  >
                    <input type="checkbox" name="weekdays" value={day.value} className="sr-only" />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="weeksAhead">
                Недель вперёд
              </label>
              <input
                id="weeksAhead"
                name="weeksAhead"
                type="number"
                min={1}
                max={52}
                defaultValue={26}
                className="field"
              />
            </div>
            <div className="flex items-end md:col-span-3">
              <SubmitButton>Добавить занятие</SubmitButton>
            </div>
          </form>
        </section>
      )}

      <div className="grid gap-5">
        {classes.length === 0 && <p className="app-card card-body text-sm">Занятий пока нет.</p>}
        {classes.map((item) => {
          const past = item.startsAt < now;
          return (
            <section key={item.id} className="app-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-accent-300">
                    {formatDate(item.startsAt)} · {formatTime(item.startsAt)} —{" "}
                    {formatTime(item.endsAt)}
                  </p>
                  <h2 className="mt-2 font-display text-lg text-foreground">{item.title}</h2>
                  <p className="mt-1.5 text-sm text-muted">
                    {item.teacher.user.name} · {item.room} · {item.level}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/classes/${item.id}`} className="btn btn-primary btn-sm">
                    Отметить посещение
                  </Link>
                  {staffIsAdmin && !past && (
                    <form action={deleteClassAction}>
                      <input type="hidden" name="classId" value={item.id} />
                      <SubmitButton variant="secondary" size="sm">
                        Удалить
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
