import { Play } from "lucide-react";
import { Container } from "./Container";
import { ButtonLink } from "./ButtonLink";
import { siteConfig } from "@/lib/site";

export function Hero() {
  return (
    <section className="bg-background pb-10 pt-6 md:pb-16 md:pt-10">
      <Container>
        <div className="stage-light relative overflow-hidden rounded-3xl border border-border px-6 py-14 sm:px-10 sm:py-20 md:px-14 md:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"
          />
          <div className="relative max-w-xl">
            <p className="label-caps">Школа бачаты</p>
            <h1 className="glow-text mt-5 font-display text-[clamp(2.75rem,11vw,6rem)] font-normal leading-[0.95] tracking-[0.06em] text-foreground">
              ALIENTO
            </h1>
            <p className="mt-5 max-w-md font-display text-xl leading-snug text-foreground/85 sm:text-2xl">
              {siteConfig.slogan}
            </p>
            <p className="prose-body mt-5 max-w-md">{siteConfig.description}</p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/register" size="lg">
                Записаться на занятие
              </ButtonLink>
              <ButtonLink href="/events" variant="ghost" size="lg" className="gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong">
                  <Play className="h-3.5 w-3.5" />
                </span>
                Расписание вечеринок
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
