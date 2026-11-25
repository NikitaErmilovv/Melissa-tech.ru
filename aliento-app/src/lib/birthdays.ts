export type BirthdayStudent = {
  id: string;
  name: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
};

export type UpcomingBirthday = BirthdayStudent & {
  dateOfBirth: string;
  daysUntil: number;
  turnsAge: number;
};

const UPCOMING_WINDOW_DAYS = 14;

function parseIsoDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

export function parseBirthDateDisplay(value: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const iso = `${match[3]}-${match[2]}-${match[1]}`;
  if (!parseIsoDate(iso)) return null;
  return iso;
}

export function formatBirthDateFromIso(iso: string) {
  const parsed = parseIsoDate(iso);
  if (!parsed) return iso;
  const dd = String(parsed.day).padStart(2, "0");
  const mm = String(parsed.month).padStart(2, "0");
  return `${dd}.${mm}.${parsed.year}`;
}

export function normalizeDateOfBirth(raw: string) {
  const trimmed = raw.trim();
  if (parseIsoDate(trimmed)) return trimmed;
  return parseBirthDateDisplay(trimmed);
}

export function isValidDateOfBirth(value: string) {
  const iso = normalizeDateOfBirth(value);
  if (!iso) return false;
  const parsed = parseIsoDate(iso);
  if (!parsed) return false;
  const birth = new Date(parsed.year, parsed.month - 1, parsed.day);
  const now = new Date();
  const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
  const max = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  return birth >= min && birth <= max;
}

export function daysUntilBirthday(dateOfBirth: string, from = new Date()) {
  const parsed = parseIsoDate(dateOfBirth);
  if (!parsed) return null;

  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let next = new Date(today.getFullYear(), parsed.month - 1, parsed.day);
  if (next < today) {
    next = new Date(today.getFullYear() + 1, parsed.month - 1, parsed.day);
  }

  return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}

export function ageOnNextBirthday(dateOfBirth: string, from = new Date()) {
  const parsed = parseIsoDate(dateOfBirth);
  if (!parsed) return null;

  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const birthdayThisYear = new Date(today.getFullYear(), parsed.month - 1, parsed.day);
  const birthdayYear = birthdayThisYear < today ? today.getFullYear() + 1 : today.getFullYear();
  return birthdayYear - parsed.year;
}

export function getUpcomingBirthdays(
  students: BirthdayStudent[],
  withinDays = UPCOMING_WINDOW_DAYS,
  from = new Date()
): UpcomingBirthday[] {
  const items: UpcomingBirthday[] = [];

  for (const student of students) {
    if (!student.dateOfBirth) continue;
    const daysUntil = daysUntilBirthday(student.dateOfBirth, from);
    if (daysUntil === null || daysUntil > withinDays) continue;

    const turnsAge = ageOnNextBirthday(student.dateOfBirth, from);
    if (turnsAge === null) continue;

    items.push({
      ...student,
      dateOfBirth: student.dateOfBirth,
      daysUntil,
      turnsAge,
    });
  }

  return items.sort((a, b) => a.daysUntil - b.daysUntil || a.name.localeCompare(b.name, "ru"));
}

export function formatBirthdayDate(dateOfBirth: string) {
  const parsed = parseIsoDate(dateOfBirth);
  if (!parsed) return dateOfBirth;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(
    new Date(parsed.year, parsed.month - 1, parsed.day)
  );
}

export function formatBirthdayFull(dateOfBirth: string) {
  const parsed = parseIsoDate(dateOfBirth);
  if (!parsed) return dateOfBirth;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(parsed.year, parsed.month - 1, parsed.day));
}

export function formatDaysUntilBirthday(daysUntil: number) {
  if (daysUntil === 0) return "сегодня";
  if (daysUntil === 1) return "завтра";
  return `через ${daysUntil} ${pluralDays(daysUntil)}`;
}

function pluralDays(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "дня";
  return "дней";
}

export { UPCOMING_WINDOW_DAYS };
