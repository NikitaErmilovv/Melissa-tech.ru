import { Send } from "lucide-react";
import { cn } from "@/lib/cn";
import { maxShareUrl, telegramUrl } from "@/lib/messengers";

export function MessengerButtons({
  size = "sm",
  message,
  className,
}: {
  size?: "sm" | "md";
  message?: string;
  className?: string;
}) {
  const tg = telegramUrl(message);
  const max = maxShareUrl(message);

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap", className)}>
      <a
        href={tg}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("btn btn-primary inline-flex items-center justify-center gap-2", size === "sm" && "btn-sm")}
      >
        <Send className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        Telegram
      </a>
      <a
        href={max}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Открыть Max"
        className={cn("btn btn-secondary inline-flex items-center justify-center gap-2", size === "sm" && "btn-sm")}
      >
        Max
      </a>
    </div>
  );
}
