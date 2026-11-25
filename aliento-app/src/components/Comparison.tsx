import { Check, X } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

const manualPath = [
  "Учиться только по роликам, без обратной связи",
  "Непонятно, с чего начать и какой у вас уровень",
  "Нет партнёров и живой практики ведения",
  "Легко бросить, когда нет расписания и сообщества",
  "Сложно выйти на вечеринку и танцевать спокойно",
];

const studioPath = [
  "Преподаватель видит вас и поправляет технику",
  "Группа подобрана по уровню — от первого шага дальше",
  "Практика в парах и ротация партнёров на занятии",
  "Понятный ритм: расписание, абонемент, прогресс",
  "Атмосфера школы, в которой хочется остаться",
];

export function Comparison() {
  return (
    <Section tone="default">
      <SectionHeading
        eyebrow="Почему так"
        align="center"
        title="Учить бачату самостоятельно или прийти в Aliento?"
        description="Ролики помогают вдохновиться. Живой класс даёт тело, партнёра, музыку и спокойную поддержку преподавателя."
        className="mx-auto"
      />

      <div className="section-stack grid items-start gap-5 lg:grid-cols-2 md:gap-6">
        <div className="content-panel">
          <h3 className="label-caps label-muted">Только самостоятельно</h3>
          <ul className="panel-list panel-divider">
            {manualPath.map((item) => (
              <li key={item} className="card-body">
                <X className="mt-0.5 h-5 w-5 shrink-0 text-red-400/80" strokeWidth={2.25} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="content-panel content-panel-highlight">
          <h3 className="label-caps">В школе Aliento</h3>
          <ul className="panel-list panel-divider">
            {studioPath.map((item) => (
              <li key={item} className="card-body text-foreground">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" strokeWidth={2.25} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
