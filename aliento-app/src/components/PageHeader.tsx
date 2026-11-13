import { Container } from "./Container";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-background pb-10 pt-6 md:pb-14 md:pt-10">
      <Container>
        <div className="stage-light relative overflow-hidden rounded-3xl border border-border px-6 py-12 sm:px-10 md:px-14 md:py-16">
          <div className="relative max-w-2xl">
            <p className="label-caps">{eyebrow}</p>
            <h1 className="mt-4 font-display text-[1.875rem] leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {description && <p className="prose-body-lg mt-5 max-w-xl">{description}</p>}
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}
