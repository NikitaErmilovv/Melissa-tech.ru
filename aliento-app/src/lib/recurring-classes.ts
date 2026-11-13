/** Monday 00:00 local for the week containing `date`. */
export function startOfWeekMonday(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/** Map JS getDay() (0=Sun … 6=Sat) to offset from Monday. */
function weekdayOffsetFromMonday(weekday: number) {
  return weekday === 0 ? 6 : weekday - 1;
}

export const DEFAULT_RECURRING_WEEKS = 26;

export function buildRecurringClassStarts(params: {
  anchorDateIso: string;
  time: string;
  weekdays: number[];
  weeksAhead: number;
}): Date[] {
  const { anchorDateIso, time, weekdays, weeksAhead } = params;
  const [hour, minute] = time.split(":").map((part) => Number(part));
  if (weekdays.length === 0 || weeksAhead <= 0) return [];

  const week0 = startOfWeekMonday(new Date(`${anchorDateIso}T12:00:00`));
  const seen = new Set<string>();
  const starts: Date[] = [];

  for (let week = 0; week < weeksAhead; week++) {
    for (const wd of weekdays) {
      const day = new Date(week0);
      day.setDate(day.getDate() + week * 7 + weekdayOffsetFromMonday(wd));
      day.setHours(hour, minute, 0, 0);
      const key = day.toISOString();
      if (seen.has(key)) continue;
      seen.add(key);
      starts.push(day);
    }
  }

  starts.sort((a, b) => a.getTime() - b.getTime());
  return starts;
}
