import { cn } from "@/lib/cn";

type Tone = "success" | "danger" | "accent" | "muted";

const MAP: Record<string, { label: string; tone: Tone }> = {
  PRESENT: { label: "Присутствовал", tone: "success" },
  ABSENT: { label: "Пропущено", tone: "danger" },
  BOOKED: { label: "Записан", tone: "accent" },
  CANCELLED: { label: "Отменён", tone: "muted" },
  PAID: { label: "Оплачено", tone: "success" },
  PENDING: { label: "Ожидает оплаты", tone: "muted" },
  FAILED: { label: "Ошибка оплаты", tone: "danger" },
  ACTIVE: { label: "Активен", tone: "success" },
  EXHAUSTED: { label: "Использован", tone: "muted" },
  EXPIRED: { label: "Истёк", tone: "danger" },
  BLOCKED: { label: "Заблокирован", tone: "danger" },
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  const entry = MAP[status] ?? { label: status, tone: "muted" as Tone };
  return (
    <span
      className={cn(
        "badge",
        entry.tone === "success" && "badge-success",
        entry.tone === "danger" && "badge-danger",
        entry.tone === "accent" && "badge-accent",
        entry.tone === "muted" && "badge-muted",
        className
      )}
    >
      {label ?? entry.label}
    </span>
  );
}
