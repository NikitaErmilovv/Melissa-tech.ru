import { prisma } from "@/lib/db";
import { plural } from "@/lib/format";

/** Длительность занятия в часах (из расписания). */
export function classDurationHours(startsAt: Date, endsAt: Date) {
  const minutes = Math.max(0, (endsAt.getTime() - startsAt.getTime()) / 60_000);
  return Math.round((minutes / 60) * 100) / 100;
}

export function roundHours(hours: number) {
  return Math.round(hours * 100) / 100;
}

export function formatHoursCompact(hours: number) {
  const value = roundHours(hours);
  if (value <= 0) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1).replace(".", ",");
}

export function formatHoursRatio(remaining: number, total: number) {
  return `${formatHoursCompact(remaining)} / ${formatHoursCompact(total)} ч`;
}

export type StudentSubscriptionRow = {
  status: string;
  remainingClasses: number;
  totalClasses: number;
  expiresAt: Date;
  plan: { name: string };
};

export function pickStudentListSubscription(subs: StudentSubscriptionRow[]) {
  const now = Date.now();
  const usable = subs
    .filter((s) => s.status === "ACTIVE" && new Date(s.expiresAt).getTime() >= now)
    .sort((a, b) => b.remainingClasses - a.remainingClasses);
  if (usable.length > 0) return usable[0];
  const anyActive = subs.find((s) => s.status === "ACTIVE");
  if (anyActive) return anyActive;
  return null;
}

export function formatHourBalance(hours: number) {
  const value = roundHours(hours);
  if (value <= 0) return "0 часов";
  const whole = Math.floor(value + 1e-6);
  const minutes = Math.round((value - whole) * 60);
  if (minutes === 0 || minutes === 60) {
    const h = minutes === 60 ? whole + 1 : whole;
    return `${h} ${plural(h, ["час", "часа", "часов"])}`;
  }
  if (whole === 0) {
    return `${minutes} ${plural(minutes, ["минута", "минуты", "минут"])}`;
  }
  return `${whole} ч ${minutes} мин`;
}

export async function deductHoursFromActiveSubscription(userId: string, hours: number) {
  const deduct = roundHours(hours);
  if (deduct <= 0) return;

  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      remainingClasses: { gt: 0 },
    },
    orderBy: { expiresAt: "asc" },
  });
  if (!sub) return;

  const remaining = roundHours(Math.max(0, sub.remainingClasses - deduct));
  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      remainingClasses: remaining,
      status: remaining <= 0 ? "EXHAUSTED" : "ACTIVE",
    },
  });
}
