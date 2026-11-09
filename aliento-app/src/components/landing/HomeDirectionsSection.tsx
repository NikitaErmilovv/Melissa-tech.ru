import { Heart, Moon, Sparkles, Users } from "lucide-react";
import { Container } from "@/components/Container";

const directions = [
  {
    icon: Heart,
    title: "Бачата",
    text: "Зажигательные ритмы и красивое взаимодействие. Учим с нуля уверенному ведению и следованию, пара не нужна — на уроке все меняются.",
  },
  {
    icon: Sparkles,
    title: "Бачата (Ladies)",
    text: "Пластика, изящные волны и уверенность в себе для девушек. Раскроем женственность и научим красиво импровизировать соло.",
  },
  {
    icon: Sparkles,
    title: "Кизомба",
    text: "Чувственный танец-объятие, построенный на полном доверии и связи в паре. Обучаем в комфортном темпе, без спешки и стресса.",
  },
] as const;

const atmosphere = [
  {
    icon: Users,
    title: "Комьюнити",
    text: "Новые знакомства и близкие друзья на одной волне. Общаемся в зале, устраиваем совместные поездки и круто проводим время.",
  },
  {
    icon: Moon,
    title: "Вечеринки",
    text: "Танцы не заканчиваются на уроках. Регулярно устраиваем тематические party, чтобы вы отдыхали и практиковались в реальном танце.",
  },
] as const;

function DirectionCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Heart;
  title: string;
  text: string;
}) {
  return (
    <li className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface/70 px-4 py-3.5 transition-colors hover:border-accent-400/40">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-accent-500/12 text-accent-300">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
      </div>
    </li>
  );
}

export function HomeDirectionsSection() {
  return (
    <section id="directions" className="border-y border-border bg-background-elevated py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl text-foreground md:text-3xl">О направлениях</h2>
          <p className="mt-2 text-sm text-muted">Два направления в зале и жизнь вокруг них: комьюнити и вечеринки.</p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {directions.map((item) => (
            <DirectionCard key={item.title} {...item} />
          ))}
        </ul>

        <h3 className="mt-10 font-display text-lg text-foreground md:text-xl">Атмосфера</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {atmosphere.map((item) => (
            <DirectionCard key={item.title} {...item} />
          ))}
        </ul>
      </Container>
    </section>
  );
}
