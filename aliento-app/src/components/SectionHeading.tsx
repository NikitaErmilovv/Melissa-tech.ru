import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:gap-6",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="max-w-4xl font-display text-[1.625rem] font-medium leading-[1.15] tracking-tight text-balance sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "prose-body-lg max-w-3xl",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
