"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/actions/auth";
import { prisma } from "@/lib/db";
import { isoDate, parseTimeLabel, startOfWeek } from "@/lib/hall-grid";
import { isAdmin } from "@/lib/format";

function hallsRedirect(weekIso: string, params: Record<string, string> = {}) {
  const search = new URLSearchParams({ week: weekIso, ...params });
  redirect(`/admin/halls?${search.toString()}`);
}

export async function createHallRentalAction(formData: FormData) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) hallsRedirect(String(formData.get("week") || isoDate(startOfWeek(new Date()))), { error: "Недостаточно прав." });

  const venueId = String(formData.get("venueId") || "").trim();
  const hall = String(formData.get("hall") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const startTime = String(formData.get("startTime") || "").trim();
  const durationMinutes = Number(formData.get("durationMinutes") || 0);
  const clientName = String(formData.get("clientName") || "").trim();
  const peopleCount = Number(formData.get("peopleCount") || 1);
  const notes = String(formData.get("notes") || "").trim();
  const week = String(formData.get("week") || isoDate(startOfWeek(new Date())));

  if (!venueId || !hall || !date || !startTime || !clientName || !durationMinutes) {
    hallsRedirect(week, { error: "Заполните все обязательные поля." });
  }

  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue || !venue.halls.includes(hall)) {
    hallsRedirect(week, { error: "Площадка или зал не найдены." });
  }

  const startMinutes = parseTimeLabel(startTime);
  const [year, month, day] = date.split("-").map(Number);
  const startsAt = new Date(year, month - 1, day, Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

  const weekStart = new Date(`${week}T12:00:00`);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000);
  const classes = await prisma.danceClass.findMany({
    where: { startsAt: { gte: weekStart, lt: weekEnd } },
  });
  const rentals = await prisma.hallRental.findMany({
    where: { startsAt: { gte: weekStart, lt: weekEnd }, venueId },
  });

  const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => aStart < bEnd && aEnd > bStart;

  for (const item of classes) {
    if ((item.venueId ?? venueId) !== venueId || item.room !== hall) continue;
    if (overlaps(startsAt, endsAt, item.startsAt, item.endsAt)) {
      hallsRedirect(week, { error: "В это время зал занят занятием школы." });
    }
  }
  for (const item of rentals) {
    if (item.hall !== hall) continue;
    if (overlaps(startsAt, endsAt, item.startsAt, item.endsAt)) {
      hallsRedirect(week, { error: "В это время зал уже сдан в аренду." });
    }
  }

  await prisma.hallRental.create({
    data: {
      venueId,
      hall,
      clientName,
      peopleCount: Math.max(1, peopleCount),
      notes: notes || undefined,
      startsAt,
      endsAt,
      isDemo: false,
    },
  });

  revalidatePath("/admin/halls");
  revalidatePath("/schedule");
  hallsRedirect(week, { saved: "1" });
}

export async function deleteHallRentalAction(id: string, week: string) {
  const staff = await requireStaff();
  if (!isAdmin(staff.role)) return { error: "Недостаточно прав." };

  await prisma.hallRental.delete({ where: { id } });
  revalidatePath("/admin/halls");
  revalidatePath("/schedule");
  return { ok: true, week };
}
