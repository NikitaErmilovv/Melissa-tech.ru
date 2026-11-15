export const OFFICE_TZ = "Asia/Novosibirsk";

export function dayKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: OFFICE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function formatDay(iso: string): string {
  const label = new Intl.DateTimeFormat("ru-RU", {
    timeZone: OFFICE_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: OFFICE_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatStamp(iso: string): string {
  return `${formatDay(iso)}, ${formatTime(iso)}`;
}
