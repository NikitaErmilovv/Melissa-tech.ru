import { cn } from "@/lib/cn";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-border-strong bg-accent-500/15 font-display text-accent-300",
        size === "sm" && "h-9 w-9 text-xs",
        size === "md" && "h-12 w-12 text-sm",
        size === "lg" && "h-20 w-20 text-xl",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
