import { Suspense } from "react";
import Link from "next/link";
import { requireStaff } from "@/actions/auth";
import { HallGridSection } from "@/components/HallHallsClient";
import { HallRentalForm } from "@/components/HallRentalForm";
import { HallLegend } from "@/components/HallLegend";
import { HallWeekNav } from "@/components/HallWeekNav";
import { prisma } from "@/lib/db";
import { loadHallGrid } from "@/lib/hall-grids";
import { isoDate, startOfWeek } from "@/lib/hall-grid";
import { isAdmin } from "@/lib/format";

export const metadata = {
  title: "Занятость зала",
};

export default async function AdminHallsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; saved?: string; error?: string }>;
}) {
  const user = await requireStaff();
  const canManage = isAdmin(user.role);
  const { week, saved, error } = await searchParams;

  const weekStart = week ? new Date(`${week}T12:00:00`) : startOfWeek(new Date());
  const weekStartIso = isoDate(weekStart);
  const venues = await prisma.venue.findMany();
  const hallGrid = await loadHallGrid(weekStart);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Занятость зала</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Одна таблица на неделю — один зал, один слот времени. Изменения видны на{" "}
            <Link href="/schedule" className="text-accent-300 link-underline">
              странице расписания
            </Link>
            .
          </p>
        </div>
        <Suspense fallback={<div className="h-10 w-48 animate-pulse rounded-lg bg-surface-2" />}>
          <HallWeekNav weekStartIso={weekStartIso} basePath="/admin/halls" />
        </Suspense>
      </div>

      {saved === "1" && (
        <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Аренда добавлена — календарь на сайте обновлён.
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <HallLegend activityTypes={hallGrid.activityTypes} />

      {canManage && (
        <HallRentalForm
          venues={venues}
          weekStartIso={weekStartIso}
          activityTypes={hallGrid.activityTypes}
        />
      )}

      <HallGridSection grid={hallGrid} canManage={canManage} weekStartIso={weekStartIso} />
    </div>
  );
}
