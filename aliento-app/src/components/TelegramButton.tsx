import Link from "next/link";
import { ArrowUpRight, Send } from "lucide-react";
import { cn } from "@/lib/cn";

interface TelegramButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  icon?: boolean;
  onClick?: () => void;
}

export function TelegramButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  icon = true,
  onClick,
}: TelegramButtonProps) {
  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 text-center max-sm:whitespace-normal sm:whitespace-nowrap",
        size === "lg" ? "px-5 py-3.5 text-sm sm:px-7 sm:py-4 sm:text-base" : "px-5 py-3 text-sm",
        variant === "primary" &&
          "bg-foreground text-background hover:bg-accent-300 hover:-translate-y-0.5 shadow-[0_0_0_0_rgba(251,237,163,0)] hover:shadow-[0_8px_30px_-8px_rgba(251,237,163,0.45)]",
        variant === "secondary" &&
          "glass-card text-foreground hover:border-accent-400/50 hover:-translate-y-0.5",
        variant === "ghost" &&
          "text-foreground/90 hover:text-accent-300 underline decoration-border underline-offset-4 hover:decoration-accent-400",
        className
      )}
    >
      {icon && <Send className="h-4 w-4 shrink-0" strokeWidth={2.25} />}
      <span>{children}</span>
      {variant !== "ghost" && (
        <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </Link>
  );
}
