import { CalendarCheck, HeartHandshake, Sparkles, Users } from "lucide-react";
import { Container } from "./Container";

const features = [
  {
    icon: Users,
    title: "Для всех уровней",
    text: "От первого шага до уверенной импровизации",
  },
  {
    icon: Sparkles,
    title: "Опытные преподаватели",
    text: "Индивидуальный подход к каждому",
  },
  {
    icon: HeartHandshake,
    title: "Дружная атмосфера",
    text: "Танцы, общение, новые знакомства",
  },
  {
    icon: CalendarCheck,
    title: "Удобное расписание",
    text: "Вечерние классы и запись из кабинета",
  },
];

export function FeatureRow() {
  return (
    <section className="border-y border-border bg-background-elevated py-8">
      <Container>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <li key={feature.title} className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-accent-500/12 text-accent-300">
                <feature.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{feature.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{feature.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
