"use client";

import { useState } from "react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/cn";

const trialSteps = [
  {
    title: "Выберите удобный день",
    description: "Посмотрите расписание и решите, какая группа ближе по уровню и времени.",
  },
  {
    title: "Напишите нам",
    description: "В Telegram подтвердим свободное место, подскажем, что надеть и как пройти в зал.",
  },
  {
    title: "Приходите на пробный класс",
    description: "Познакомитесь с преподавателем, группой и атмосферой — без долгого ожидания.",
  },
  {
    title: "Решите, как продолжать",
    description: "Если откликнется — оформите абонемент или запишитесь на индивидуальные занятия.",
  },
  {
    title: "Танцуйте регулярно",
    description: "База, ведение, музыкальность и уверенность на вечеринках приходят с практикой.",
  },
];

const passSteps = [
  {
    title: "Подберите абонемент",
    description: "Количество занятий и срок зависят от того, как часто вы хотите ходить.",
  },
  {
    title: "Зафиксируйте группу",
    description: "Регулярное время помогает быстрее прогрессировать и не терять ритм.",
  },
  {
    title: "Приходите на занятия",
    description: "Отмечаем визиты, следим за прогрессом и подсказываем, когда пора на следующий уровень.",
  },
  {
    title: "Дополняйте практику",
    description: "Можно взять индивидуальное занятие или прийти на вечеринку школы.",
  },
  {
    title: "Продлите, когда будете готовы",
    description: "Абонемент удобно обновлять заранее, чтобы не выпадать из графика.",
  },
];

export function HowItWorks() {
  const [tab, setTab] = useState<"trial" | "pass">("trial");
  const steps = tab === "trial" ? trialSteps : passSteps;

  return (
    <Section id="how-it-works" tone="default">
      <SectionHeading
        eyebrow="Как это работает"
        align="center"
        title="Выбрать класс → записаться → прийти → танцевать"
        description="Мы берём на себя запись и подбор уровня, чтобы вы могли сосредоточиться на танце, а не на организационной суете."
        className="mx-auto"
      />

      <div className="segment-control">
        <button
          type="button"
          onClick={() => setTab("trial")}
          className={cn(
            "segment-pill",
            tab === "trial" ? "segment-pill-active" : "segment-pill-inactive"
          )}
        >
          Хочу на пробное
        </button>
        <button
          type="button"
          onClick={() => setTab("pass")}
          className={cn(
            "segment-pill",
            tab === "pass" ? "segment-pill-active" : "segment-pill-inactive"
          )}
        >
          Хочу абонемент
        </button>
      </div>

      <ol className="section-stack mx-auto grid max-w-4xl gap-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="content-panel content-panel-interactive step-row"
          >
            <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <h3 className="card-title">{step.title}</h3>
              <p className="card-body mt-2">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
