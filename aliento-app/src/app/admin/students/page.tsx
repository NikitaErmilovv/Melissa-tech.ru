import Link from "next/link";
import { Search } from "lucide-react";
import { CreateStudentPanel } from "@/components/CreateStudentPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { UpcomingBirthdaysPanel } from "@/components/UpcomingBirthdaysPanel";
import { requireStaff } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { getUpcomingBirthdays, formatBirthdayFull } from "@/lib/birthdays";
import { syncBirthdayAdminNotifications } from "@/lib/birthday-alerts";
import { formatDate, formatRub, isAdmin } from "@/lib/format";
import { readNewStudentFlash } from "@/lib/student-issue-flash";
import { StudentListSubscription } from "@/components/StudentListSubscription";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string; created?: string }>;
}) {
  const user = await requireStaff();
  const staffIsAdmin = isAdmin(user.role);

  const { q, error, created } = await searchParams;
  const newStudent =
    staffIsAdmin && created === "1" ? await readNewStudentFlash() : null;
  const query = (q ?? "").trim().toLowerCase();
  const all = await prisma.user.findMany({ where: { role: "STUDENT" } });
  const upcomingBirthdays = getUpcomingBirthdays(all);

  if (staffIsAdmin) {
    await syncBirthdayAdminNotifications();
  }

  const students = query
    ? all.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.phone.toLowerCase().includes(query)
      )
    : all;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl md:text-3xl">Ученики</h1>
        <p className="text-sm text-muted">Всего: {all.length}</p>
      </div>

      {error && <p className="app-card border-danger/40 text-sm text-danger">{error}</p>}

      {newStudent && (
        <section className="app-card border-success/40">
          <h2 className="app-card-title text-success">Ученик «{newStudent.name}» создан</h2>
          <p className="mt-2 text-sm text-muted">
            Он уже в списке ниже. Передайте логин и пароль для входа. Карточку ученика можно открыть по
            имени в таблице.
          </p>
          <dl className="mt-4 space-y-2 font-mono text-sm">
            <div>
              <dt className="text-xs text-muted-dim">Логин (email)</dt>
              <dd className="text-foreground">{newStudent.login}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-dim">Пароль</dt>
              <dd className="text-accent-300">{newStudent.pass}</dd>
            </div>
          </dl>
        </section>
      )}

      {staffIsAdmin && <CreateStudentPanel />}

      <UpcomingBirthdaysPanel birthdays={upcomingBirthdays} />

      <section className="app-card">
        <form className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="field-label" htmlFor="q">
              Поиск по имени, email или телефону
            </label>
            <input id="q" name="q" defaultValue={q ?? ""} className="field" placeholder="Анна" />
          </div>
          <button type="submit" className="btn btn-primary">
            <Search className="h-4 w-4" />
            Найти
          </button>
          {query && (
            <Link href="/admin/students" className="btn btn-ghost">
              Сбросить
            </Link>
          )}
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="data-table min-w-[760px]">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Контакты</th>
                <th>Абонемент · часы</th>
                {staffIsAdmin && <th>Оплачено</th>}
                <th className="text-right">Статус</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan={staffIsAdmin ? 5 : 4} className="text-muted">
                    Ничего не найдено.
                  </td>
                </tr>
              )}
              {students.map((student) => {
                const paid = student.payments
                  .filter((p) => p.status === "PAID")
                  .reduce((sum, p) => sum + p.amountRub, 0);
                const isNew = newStudent?.studentId === student.id;
                return (
                  <tr key={student.id} className={isNew ? "bg-success/5" : undefined}>
                    <td>
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-foreground link-underline"
                      >
                        {student.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-dim">
                        с {formatDate(student.createdAt)}
                      </p>
                    </td>
                    <td>
                      <p>{student.phone}</p>
                      <p className="text-xs text-muted-dim">{student.email}</p>
                      {student.dateOfBirth && (
                        <p className="mt-1 text-xs text-muted-dim">
                          {formatBirthdayFull(student.dateOfBirth)}
                        </p>
                      )}
                    </td>
                    <td>
                      <StudentListSubscription subscriptions={student.subscriptions} />
                    </td>
                    {staffIsAdmin && <td>{formatRub(paid)}</td>}
                    <td className="text-right">
                      <StatusBadge status={student.blocked ? "BLOCKED" : "ACTIVE"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
