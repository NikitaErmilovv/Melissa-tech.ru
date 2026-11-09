import Link from "next/link";
import { Suspense } from "react";
import { ScheduleDatePicker } from "@/components/ScheduleDatePicker";
import { requireStaff } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatTime, isAdmin } from "@/lib/format";

function startOfDay(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireStaff();
  const { date } = await searchParams;
  const selected = date ?? new Date().toISOString().slice(0, 10);
  const dayStart = startOfDay(selected);
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);

  const classes = await prisma.danceClass.findMany({
    where: {
      startsAt: { gte: dayStart, lt: dayEnd },
      ...(isAdmin(user.role) ? {} : { teacher: { userId: user.id } }),
    },
    include: { bookings: { where: { status: "BOOKED" } } },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl md:text-3xl">Расписание</h1>
        <p className="text-sm text-muted">{formatDate(dayStart)}</p>
      </div>

      <Suspense fallback={<div className="app-card h-28 animate-pulse" />}>
        <ScheduleDatePicker selected={selected} />
      </Suspense>

      <section className="app-card">
        <h2 className="app-card-title">Занятия на {formatDate(dayStart)}</h2>
        {classes.length === 0 ? (
          <p className="card-body mt-5 text-sm">На эту дату занятий нет.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {classes.map((item) => (
              <details key={item.id} className="rounded-xl border border-border bg-surface">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                  <span className="w-14 shrink-0 text-sm text-accent-300">
                    {formatTime(item.startsAt)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-dim">
                      {item.level} · {item.room} · {item.teacher.user.name}
                    </p>
                  </div>
                  <span className="text-sm text-muted">
                    {item.bookings.length}/{item.capacity} записано
                  </span>
                </summary>
                <div className="border-t border-border px-4 py-4">
                  {item.bookings.length === 0 ? (
                    <p className="text-sm text-muted">Записей пока нет.</p>
                  ) : (
                    <ul className="space-y-2">
                      {item.bookings.map((booking) => (
                        <li
                          key={booking.id}
                          className="flex flex-wrap items-center justify-between gap-2 text-sm"
                        >
                          <Link
                            href={`/admin/students/${booking.user.id}`}
                            className="text-foreground link-underline"
                          >
                            {booking.user.name}
                          </Link>
                          <span className="text-muted-dim">{booking.user.phone}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
