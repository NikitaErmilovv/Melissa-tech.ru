import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClassAttendanceRoster } from "@/components/ClassAttendanceRoster";
import { requireStaff } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatTime, isAdmin } from "@/lib/format";

export default async function AdminClassAttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaff();
  const staffIsAdmin = isAdmin(staff.role);
  const { id } = await params;

  const danceClass = await prisma.danceClass.findUnique({
    where: { id },
    include: { teacher: { include: { user: true } } },
  });

  if (!danceClass) {
    return <p className="app-card card-body text-sm">Занятие не найдено.</p>;
  }

  if (!staffIsAdmin && danceClass.teacher.userId !== staff.id) {
    return <p className="app-card card-body text-sm">Это занятие ведёт другой преподаватель.</p>;
  }

  const [students, attendances] = await Promise.all([
    prisma.user.findMany({ where: { role: "STUDENT" } }),
    prisma.attendance.findMany({ where: { classId: id } }),
  ]);

  const statusByUser = new Map(
    attendances.map((a) => [a.userId, a.status as "PRESENT" | "ABSENT"])
  );

  const roster = students.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    blocked: s.blocked,
    attendanceStatus: statusByUser.get(s.id),
  }));
  const rosterSorted = [...roster].sort((a, b) => a.name.localeCompare(b.name, "ru"));

  return (
    <div className="space-y-5">
      <Link href="/admin/classes" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Все занятия
      </Link>

      <section className="app-card">
        <p className="text-sm text-accent-300">
          {formatDate(danceClass.startsAt)} · {formatTime(danceClass.startsAt)} —{" "}
          {formatTime(danceClass.endsAt)}
        </p>
        <h1 className="mt-2 font-display text-2xl text-foreground">{danceClass.title}</h1>
        <p className="mt-2 text-sm text-muted">
          {danceClass.teacher.user.name} · {danceClass.room} · {danceClass.level}
        </p>
        <p className="mt-4 text-sm text-muted">
          Отметьте, кто был на занятии. Список — все ученики школы; при «Был» часы абонемента спишутся
          автоматически.
        </p>
        <ClassAttendanceRoster classId={danceClass.id} students={rosterSorted} />
      </section>
    </div>
  );
}
