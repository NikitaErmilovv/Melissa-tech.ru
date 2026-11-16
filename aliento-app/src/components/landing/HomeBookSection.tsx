import { Container } from "@/components/Container";
import { MessengerButtons } from "@/components/landing/MessengerButtons";

export function HomeBookSection() {
  return (
    <section id="book" className="bg-background pb-10 pt-6 md:pb-16 md:pt-10">
      <Container>
        <div className="stage-light relative overflow-hidden rounded-3xl border border-border px-6 py-14 sm:px-10 sm:py-20 md:px-14 md:py-28">
          <div className="relative z-10 max-w-xl">
            <p className="label-caps">Запись</p>
            <h1 className="glow-text mt-5 font-display text-[clamp(2.75rem,11vw,6rem)] font-normal leading-[0.95] tracking-[0.06em] text-foreground">
              ALIENTO
            </h1>
            <p className="mt-5 max-w-md font-display text-xl leading-snug text-foreground/85 sm:text-2xl">
              Танец, который чувствуется сердцем
            </p>
            <p className="prose-body mt-5 max-w-lg text-[0.98rem] leading-relaxed sm:text-base">
              Бачата и кизомба в Новосибирске. Приходите на пробное — дальше расскажем про группы,
              абонементы и вечеринки. Напишите нам в Telegram или Max, ответим сами.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <MessengerButtons size="md" className="!flex-row" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
