import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { BlockUserButton } from "@/components/BlockUserButton";
import { SubscriptionAdminActions } from "@/components/SubscriptionAdminActions";
import { GrantSubscriptionForm } from "@/components/GrantSubscriptionForm";
import { AdminStudentEditForm } from "@/components/AdminStudentEditForm";
import { requireStaff } from "@/actions/auth";
import { prisma } from "@/lib/db";
import {
  formatDate,
  formatDateNumeric,
  formatMonthYear,
  formatRub,
  isAdmin,
} from "@/lib/format";
import { formatBirthdayFull, ageOnNextBirthday } from "@/lib/birthdays";
import { formatHourBalance } from "@/lib/subscription-balance";
import { SubscriptionAdjustForm } from "@/components/SubscriptionAdjustForm";

export default async function AdminStudentProfile({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; granted?: string; saved?: string }>;
}) {
  const staff = await requireStaff();
  const staffIsAdmin = isAdmin(staff.role);

  const { id } = await params;
  const { error, granted, saved } = await searchParams;
  const plans = await prisma.plan.findMany();
  const student = await prisma.user.findUnique({ where: { id } });
  if (!student || student.role !== "STUDENT") {
    return <p className="app-card card-body text-sm">Ученик не найден.</p>;
  }

  const attendances = await prisma.attendance.findMany({ where: { userId: student.id } });
  const visited = attendances.filter((a) => a.status === "PRESENT").length;
  const missed = attendances.filter((a) => a.status === "ABSENT").length;
  const paid = student.payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amountRub, 0);
  const activeSub = student.subscriptions.find((s) => s.status === "ACTIVE") ?? null;

  return (
    <div className="space-y-5">
      {error && <p className="app-card border-danger/40 text-sm text-danger">{error}</p>}
      {granted && <p className="app-card text-sm text-success">Абонемент выдан ученику.</p>}
      {saved && <p className="app-card text-sm text-success">Данные ученика сохранены.</p>}
      <Link href="/admin/students" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Все ученики
      </Link>

      <section className="app-card">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar name={student.name} size="lg" />
            <div>
              <h1 className="font-display text-xl text-foreground md:text-2xl">{student.name}</h1>
              <p className="mt-1.5 text-sm text-muted">
                {student.phone} · {student.email}
              </p>
              {student.dateOfBirth && (
                <p className="mt-1 text-sm text-muted">
                  День рождения: {formatBirthdayFull(student.dateOfBirth)}
                  {(() => {
                    const age = ageOnNextBirthday(student.dateOfBirth);
                    return age !== null ? ` · ${age} лет` : "";
                  })()}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-dim">
                В школе с {formatMonthYear(student.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={student.blocked ? "BLOCKED" : "ACTIVE"} />
            {staffIsAdmin && <BlockUserButton userId={student.id} blocked={student.blocked} />}
          </div>
        </div>
      </section>

      <AdminStudentEditForm
        studentId={student.id}
        name={student.name}
        email={student.email}
        phone={student.phone}
        dateOfBirth={student.dateOfBirth}
        canEditLogin={staffIsAdmin}
      />

      <div className={`grid gap-4 sm:grid-cols-2 ${staffIsAdmin ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
        <div className="app-card">
          <p className="stat-label">Посещений</p>
          <p className="stat-value">{visited}</p>
        </div>
        <div className="app-card">
          <p className="stat-label">Пропусков</p>
          <p className="stat-value">{missed}</p>
        </div>
        {staffIsAdmin && (
          <div className="app-card">
            <p className="stat-label">Оплачено</p>
            <p className="stat-value">{formatRub(paid)}</p>
          </div>
        )}
        <div className="app-card">
          <p className="stat-label">Остаток часов</p>
          <p className="stat-value">
            {activeSub ? formatHourBalance(activeSub.remainingClasses) : "—"}
          </p>
        </div>
      </div>

      <div className={`grid gap-5 ${staffIsAdmin ? "xl:grid-cols-2" : ""}`}>
        <section className="app-card">
          <h2 className="app-card-title">Абонементы</h2>
          <GrantSubscriptionForm studentId={student.id} plans={plans} />
          <div className="mt-5 overflow-x-auto">
            <table className="data-table min-w-[420px]">
              <thead>
                <tr>
                  <th>Абонемент</th>
                  <th>Остаток</th>
                  <th>До</th>
                  <th className="text-right">Статус</th>
                  {staffIsAdmin && <th className="text-right">Действия</th>}
                </tr>
              </thead>
              <tbody>
                {student.subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={staffIsAdmin ? 5 : 4} className="text-muted">
                      Абонементов нет.
                    </td>
                  </tr>
                )}
                {student.subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="text-foreground">{sub.plan.name}</td>
                    <td>
                      {formatHourBalance(sub.remainingClasses)} / {formatHourBalance(sub.totalClasses)}
                    </td>
                    <td>{formatDate(sub.expiresAt)}</td>
                    <td className="text-right">
                      <StatusBadge status={sub.status} />
                    </td>
                    {staffIsAdmin && (
                      <td className="text-right">
                        <SubscriptionAdminActions
                          subscriptionId={sub.id}
                          status={sub.status}
                          studentId={student.id}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {staffIsAdmin &&
            student.subscriptions
              .filter((s) => s.status === "ACTIVE" || s.status === "EXHAUSTED")
              .map((sub) => (
                <SubscriptionAdjustForm
                  key={`adj-${sub.id}`}
                  subscription={sub}
                  studentId={student.id}
                />
              ))}
        </section>

        {staffIsAdmin && (
          <section className="app-card">
            <h2 className="app-card-title">Платежи</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="data-table min-w-[420px]">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Описание</th>
                    <th>Сумма</th>
                    <th className="text-right">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {student.payments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-muted">
                        Платежей нет.
                      </td>
                    </tr>
                  )}
                  {student.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDateNumeric(payment.createdAt)}</td>
                      <td className="text-foreground">{payment.purpose}</td>
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

      <section className="app-card">
        <h2 className="app-card-title">История посещений</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table min-w-[560px]">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Занятие</th>
                <th>Зал</th>
                <th className="text-right">Статус</th>
              </tr>
            </thead>
            <tbody>
              {attendances.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted">
                    Посещений пока нет.
                  </td>
                </tr>
              )}
              {attendances.slice(0, 15).map((row) => (
                <tr key={row.id}>
                  <td>{formatDateNumeric(row.class.startsAt)}</td>
                  <td className="text-foreground">{row.class.title}</td>
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
