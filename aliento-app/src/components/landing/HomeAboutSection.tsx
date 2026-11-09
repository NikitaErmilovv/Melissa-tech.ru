import { Container } from "@/components/Container";

const steps = [
  {
    title: "Напишите нам",
    text: "В Telegram или Max — подскажем ближайшее пробное и какая группа подойдёт.",
  },
  {
    title: "Пробное занятие",
    text: "Бесплатно. Смотрите зал, преподавателя и атмосферу — без обязательств.",
  },
  {
    title: "Абонемент",
    text: "Это количество занятий, а не «одна фиксированная группа». Ходите в удобном ритме.",
  },
  {
    title: "Вечеринки и практика",
    text: "Когда база есть — выходите танцевать с теми, кого уже знаете по залу.",
  },
] as const;

export function HomeAboutSection() {
  return (
    <section id="about" className="bg-background py-14 md:py-20">
      <Container>
        <ol className="grid gap-5 sm:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step.title} className="step-row">
              <span className="step-number">{index + 1}</span>
              <span>
                <span className="block text-base text-foreground">{step.title}</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
