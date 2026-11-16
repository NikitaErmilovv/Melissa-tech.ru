import type { ScheduleDay, ScheduleRow } from "@/components/ScheduleTabs";
import { formatTime } from "./format";

type ClassLike = {
  id: string;
  title: string;
  level: string;
  room: string;
  startsAt: Date;
  endsAt: Date;
  teacher: { user: { name: string } };
};

const WEEK = [
  { key: "mon", label: "Понедельник", short: "Пн", jsDay: 1 },
  { key: "tue", label: "Вторник", short: "Вт", jsDay: 2 },
  { key: "wed", label: "Среда", short: "Ср", jsDay: 3 },
  { key: "thu", label: "Четверг", short: "Чт", jsDay: 4 },
  { key: "fri", label: "Пятница", short: "Пт", jsDay: 5 },
  { key: "sat", label: "Суббота", short: "Сб", jsDay: 6 },
  { key: "sun", label: "Воскресенье", short: "Вс", jsDay: 0 },
];

/**
 * Collapses upcoming events into a weekday grid for the home page party schedule.
 */
export function buildEventScheduleDays(
  events: { id: string; title: string; description: string; place: string; startsAt: Date }[]
): ScheduleDay[] {
  const now = new Date();
  const upcoming = [...events]
    .filter((e) => e.startsAt >= now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return WEEK.map((day) => {
    const rows: ScheduleRow[] = [];
    for (const item of upcoming) {
      if (item.startsAt.getDay() !== day.jsDay) continue;
      rows.push({
        id: item.id,
        time: formatTime(item.startsAt),
        title: item.title,
        level: "Без записи",
        room: item.place,
        teacher: "",
      });
    }
    return { key: day.key, label: day.label, short: day.short, rows };
  });
}

/**
 * Collapses the recurring class grid into a single week: repeated occurrences of
 * the same slot (time + title + room) show up once per weekday.
 */
export function filterClassesWithinDays<T extends { startsAt: Date }>(classes: T[], dayCount: number): T[] {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + dayCount);
  end.setHours(23, 59, 59, 999);

  return [...classes]
    .filter((item) => item.startsAt >= now && item.startsAt <= end)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export function buildScheduleDays(classes: ClassLike[]): ScheduleDay[] {
  return WEEK.map((day) => {
    const seen = new Set<string>();
    const rows: ScheduleRow[] = [];

    for (const item of [...classes].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())) {
      if (item.startsAt.getDay() !== day.jsDay) continue;
      const time = `${formatTime(item.startsAt)} – ${formatTime(item.endsAt)}`;
      const slot = `${time}|${item.title}|${item.room}`;
      if (seen.has(slot)) continue;
      seen.add(slot);
      rows.push({
        id: item.id,
        time,
        title: item.title,
        level: item.level,
        room: item.room,
        teacher: item.teacher.user.name,
      });
    }

    return { key: day.key, label: day.label, short: day.short, rows };
  });
}
