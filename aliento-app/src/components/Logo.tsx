import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  size = "md",
  href = "/",
  className,
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
}) {
  const mark = (
    <span className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "wordmark",
          size === "sm" && "text-base",
          size === "md" && "text-xl",
          size === "lg" && "text-3xl"
        )}
      >
        Aliento
      </span>
      <span className="wordmark-sub">школа бачаты</span>
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} className="shrink-0">
      {mark}
    </Link>
  );
}
