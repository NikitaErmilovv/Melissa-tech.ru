import Image from "next/image";
import { Container } from "@/components/Container";
import { publicAsset } from "@/lib/site";

const HALL_PHOTO_CAPTION = "Aliento, проспект Карла Маркса";

const hallPoints = [
  {
    title: "Удобное расположение",
    text: "Мы находимся в нескольких минутах пешком от метро Студенческая, поэтому вам будет легко добраться на занятия всегда легко и быстро после работы или учебы.",
  },
  {
    title: "Правильный свет и зеркала",
    text: "Огромные зеркала во всю стену позволяют детально отрабатывать технику, а регулируемая подсветка создает подходящий настрой для вечеринок и чувственных танцев.",
  },
  {
    title: "Свежий воздух",
    text: "Мощная система вентиляции и кондиционирования поддерживает идеальный климат-контроль — у нас комфортно даже во время самых жарких треков.",
  },
  {
    title: "Комфорт и уют",
    text: "Для вашего удобства у нас есть раздевалки, где можно спокойно переодеться перед занятием, а также уютная зона отдыха, чтобы выпить чаю и пообщаться.",
  },
] as const;

export function HomeHallSection() {
  return (
    <section id="hall" className="bg-background py-14 md:py-20">
      <Container>
        <div className="grid overflow-hidden rounded-3xl border border-border bg-surface lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[17rem] sm:min-h-[22rem] lg:min-h-[28rem]">
            <Image
              src={publicAsset("/images/studio-hall-relax.webp")}
              alt="Зона отдыха в студии Aliento"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:via-black/5 lg:to-black/35"
              aria-hidden
            />
            <p className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] tracking-wide text-white backdrop-blur-sm">
              {HALL_PHOTO_CAPTION}
            </p>
          </div>

          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
            <h2 className="font-display text-3xl leading-tight text-foreground md:text-4xl">О нашем зале</h2>
            <p className="prose-body mt-5 max-w-md">
              Мы создали не просто зал для тренировок, а настоящее танцевальное комьюнити, где каждый
              чувствует себя уверенно и свободно. Наша студия продумана так, чтобы ничто не отвлекало вас
              от ритмов бачаты и кизомбы:
            </p>
            <ul className="mt-8 space-y-4">
              {hallPoints.map((item) => (
                <li key={item.title}>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
