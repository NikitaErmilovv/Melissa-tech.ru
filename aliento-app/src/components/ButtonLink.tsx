import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

function classes(variant: Variant, size: Size, className?: string) {
  return cn(
    "btn",
    size === "lg" && "btn-lg",
    size === "sm" && "btn-sm",
    variant === "primary" && "btn-primary",
    variant === "secondary" && "btn-secondary",
    variant === "ghost" && "btn-ghost",
    className
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={classes(variant, size, className)}
    >
      {children}
    </Link>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
}: {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button type="submit" disabled={disabled} className={classes(variant, size, className)}>
      {children}
    </button>
  );
}
