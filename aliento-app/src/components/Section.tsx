import { cn } from "@/lib/cn";
import { Container } from "./Container";

export function Section({
  id,
  tone = "default",
  className,
  containerClassName,
  children,
}: {
  id?: string;
  tone?: "default" | "elevated";
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-16 md:py-36",
        tone === "elevated" ? "bg-background-elevated" : "bg-background",
        className
      )}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
