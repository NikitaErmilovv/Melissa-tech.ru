import { cn } from "@/lib/cn";

/**
 * Decorative ambient background: soft warm glow (D2-style accent), plus faint line-art.
 */
export function BackgroundGlow({
  className,
  variant = "hero",
}: {
  className?: string;
  variant?: "hero" | "section";
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className={cn(
          "absolute rounded-full blur-[110px]",
          variant === "hero"
            ? "-top-40 left-1/2 h-[560px] w-[720px] -translate-x-1/2 opacity-60"
            : "-top-24 left-1/3 h-[360px] w-[480px] opacity-30"
        )}
        style={{
          background:
            "radial-gradient(circle, rgba(251,237,163,0.42) 0%, rgba(212,194,122,0.22) 45%, rgba(212,194,122,0) 75%)",
        }}
      />
      <div
        className={cn(
          "absolute rounded-full blur-[100px]",
          variant === "hero"
            ? "top-20 right-[-10%] h-[420px] w-[420px] opacity-40"
            : "bottom-0 right-[-5%] h-[280px] w-[320px] opacity-20"
        )}
        style={{
          background:
            "radial-gradient(circle, rgba(255,241,188,0.32) 0%, rgba(168,148,88,0.16) 55%, rgba(168,148,88,0) 80%)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.14]"
        viewBox="0 0 1200 800"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M -50 620 C 250 700, 450 200, 700 120 S 1150 260, 1260 60"
          stroke="white"
          strokeWidth="1"
        />
        <path
          d="M -80 120 C 180 60, 420 480, 760 520 S 1100 420, 1280 620"
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)",
        }}
      />
    </div>
  );
}
