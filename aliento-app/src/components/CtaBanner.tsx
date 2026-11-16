import { Container } from "./Container";
import { ButtonLink } from "./ButtonLink";

export function CtaBanner({
  title = "Начни танцевать уже сегодня!",
  description = "Присоединяйся к нашей танцевальной семье и открой магию бачаты вместе с нами",
  primaryLabel = "Записаться сейчас",
  primaryHref = "/register",
  secondaryLabel,
  secondaryHref,
}: {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="bg-background py-14 md:py-20">
      <Container>
        <div className="stage-light relative overflow-hidden rounded-3xl border border-border px-6 py-14 text-center md:py-20">
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-[1.75rem] leading-tight text-foreground md:text-4xl">
              {title}
            </h2>
            <p className="prose-body mt-4">{description}</p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <ButtonLink href={primaryHref} size="lg">
                {primaryLabel}
              </ButtonLink>
              {secondaryLabel && secondaryHref && (
                <ButtonLink href={secondaryHref} variant="secondary" size="lg">
                  {secondaryLabel}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
