import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

export interface Step {
  title: string;
  description: string;
}

export function NumberedSteps({
  eyebrow,
  title,
  description,
  steps,
  tone = "default" as "default" | "elevated",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  steps: Step[];
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
