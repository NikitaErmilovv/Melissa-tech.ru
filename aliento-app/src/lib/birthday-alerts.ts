import { prisma } from "@/lib/db";
import {
  formatBirthdayDate,
  formatDaysUntilBirthday,
  getUpcomingBirthdays,
  UPCOMING_WINDOW_DAYS,
} from "@/lib/birthdays";

export async function syncBirthdayAdminNotifications(withinDays = UPCOMING_WINDOW_DAYS) {
  const [students, admins] = await Promise.all([
    prisma.user.findMany({ where: { role: "STUDENT" } }),
    prisma.user.findMany({ where: { roleIn: ["ADMIN", "OWNER"] } }),
  ]);

  if (admins.length === 0) return;

  const upcoming = getUpcomingBirthdays(students, withinDays);
  const year = new Date().getFullYear();

  for (const item of upcoming) {
    const tag = `birthday:${item.id}:${year}`;
    const when = formatDaysUntilBirthday(item.daysUntil);
    const body = `${item.name} — ${formatBirthdayDate(item.dateOfBirth)} (${when}, исполняется ${item.turnsAge})`;

    for (const admin of admins) {
      const existing = await prisma.notification.findFirst({
        where: { userId: admin.id, tag },
      });
      if (existing) continue;

      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Скоро день рождения ученика",
          body,
          tag,
          isDemo: false,
        },
      });
    }
  }
}
