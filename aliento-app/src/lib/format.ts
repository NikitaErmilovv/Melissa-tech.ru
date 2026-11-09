export type Role = "STUDENT" | "TEACHER" | "ADMIN" | "OWNER";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  emailVerified: boolean;
};

export function isStaff(role: Role) {
  return role === "TEACHER" || role === "ADMIN" || role === "OWNER";
}

export function isAdmin(role: Role) {
  return role === "ADMIN" || role === "OWNER";
}

export function formatRub(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function plural(count: number, forms: [string, string, string]) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export function formatClassCount(count: number) {
  return `${count} ${plural(count, ["занятие", "занятия", "занятий"])}`;
}

export function formatDateNumeric(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatMonthYear(date: Date) {
  const value = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" })
    .format(date)
    .replace(/\s*г\.$/, "");
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
