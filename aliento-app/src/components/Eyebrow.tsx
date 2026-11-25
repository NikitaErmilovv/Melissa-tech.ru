import { cn } from "@/lib/cn";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border border-border-strong bg-white/[0.03] px-3 py-1.5 text-center text-[10px] font-medium uppercase leading-snug tracking-[0.1em] text-accent-300 sm:px-4 sm:text-xs sm:tracking-[0.14em]",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent-400 shadow-[0_0_10px_2px_rgba(251,237,163,0.75)]" />
      {children}
    </span>
  );
}
