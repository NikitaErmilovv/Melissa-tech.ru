import { Users, User } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

const types = [
  {
    icon: Users,
    title: "Групповые занятия",
    description:
      "Учитесь в общем ритме, меняйте партнёров и быстрее привыкайте к социальным танцам.",
    fitTitle: "Подходит, если:",
    points: [
      "хотите начать с нуля или закрепить базу",
      "нравится атмосфера зала и живая практика",
      "ищете регулярный ритм и абонемент",
    ],
  },
  {
    icon: User,
    title: "Индивидуальные занятия",
    description:
      "Персональный темп, разбор вашей техники и подготовка к вечеринке или выступлению.",
    fitTitle: "Позволяет:",
    points: [
      "закрыть конкретные запросы по технике",
      "готовиться в паре или соло",
      "двигаться в удобном для вас графике",
    ],
  },
];

export function BarterTypes() {
  return (
    <Section tone="elevated">
      <SectionHeading
        eyebrow="Формат занятий"
        align="center"
        title="Группы и индивидуальные классы"
        description="Можно прийти на пробное занятие, выбрать группу по уровню или записаться к преподавателю один на один."
        className="mx-auto"
      />

      <div className="section-stack grid items-start gap-5 md:grid-cols-2 md:gap-6">
        {types.map((type) => (
          <div key={type.title} className="content-panel content-panel-interactive">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent-500/25 bg-accent-500/15 text-accent-300">
                <type.icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <h3 className="card-title">{type.title}</h3>
            </div>
            <p className="card-body mt-5">{type.description}</p>
            <div className="panel-divider">
              <p className="label-caps label-muted">{type.fitTitle}</p>
              <ul className="panel-list mt-4">
                {type.points.map((point) => (
                  <li key={point} className="card-body">
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
