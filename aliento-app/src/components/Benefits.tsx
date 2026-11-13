import { Heart, Users, Music, Sparkles, CalendarCheck, MapPin, type LucideIcon } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

export interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const brandBenefits: Benefit[] = [
  {
    icon: Heart,
    title: "Танец изнутри",
    description: "Бачата про чувство, музыку и партнёра — не про сухую схему шагов.",
  },
  {
    icon: Users,
    title: "Для всех уровней",
    description: "Можно начать с нуля или продолжить, если вы уже танцуете.",
  },
  {
    icon: Sparkles,
    title: "Опытные преподаватели",
    description: "Объясняем просто, следим за техникой и не оставляем вас один на один с залом.",
  },
  {
    icon: Music,
    title: "Живая атмосфера",
    description: "Зал, в котором комфортно ошибаться, пробовать и возвращаться снова.",
  },
  {
    icon: CalendarCheck,
    title: "Удобная запись",
    description: "Расписание, абонементы и запись на занятие — без лишней бюрократии.",
  },
  {
    icon: MapPin,
    title: "Понятный формат",
    description: "Группы, индивидуальные классы и пробное занятие, чтобы выбрать свой ритм.",
  },
];

export function Benefits({
  eyebrow = "Почему Aliento",
  title = "Школа, в которой хочется танцевать",
  description = "Мы собираем занятия, преподавателей и атмосферу так, чтобы бачата стала частью жизни, а не разовым экспериментом.",
  items = brandBenefits,
  tone = "elevated" as "default" | "elevated",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: Benefit[];
  tone?: "default" | "elevated";
}) {
  return (
    <Section tone={tone}>
      <SectionHeading
        eyebrow={eyebrow}
        align="center"
        title={title}
        description={description}
        className="mx-auto"
      />

      <div className="section-stack grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {items.map((benefit) => (
          <div key={benefit.title} className="content-panel content-panel-interactive">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500/15 text-accent-300">
              <benefit.icon className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h3 className="card-title mt-5">{benefit.title}</h3>
            <p className="card-body mt-3">{benefit.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
