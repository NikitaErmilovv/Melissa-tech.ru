import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { TelegramButton } from "./TelegramButton";
import { marketFacts, productDefinition, trustSignals } from "@/lib/facts-data";
import { siteConfig } from "@/lib/site";

export function KeyFacts() {
  return (
    <Section id="about" tone="default">
      <SectionHeading
        eyebrow="О школе"
        align="center"
        title="Что такое Aliento"
        description={productDefinition}
        className="mx-auto max-w-3xl"
      />

      <dl className="section-stack grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {marketFacts.map((fact) => (
          <div key={fact.unit + fact.value} className="content-panel content-panel-interactive">
            <dt>
              <span className="block font-display text-3xl font-medium leading-none text-accent-300 max-md:whitespace-normal md:text-5xl md:whitespace-nowrap">
                {fact.value}
              </span>
              <span className="label-caps mt-3 block">{fact.unit}</span>
            </dt>
            <dd className="card-body panel-divider">{fact.detail}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 md:mt-14">
        {trustSignals.map((signal) =>
          "href" in signal && signal.href ? (
            <Link
              key={signal.label}
              href={signal.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-border-strong bg-white/[0.06] px-4 py-2.5 text-sm prose-body transition-colors hover:border-accent-500/40 hover:text-foreground sm:w-auto sm:max-w-none sm:px-5 sm:py-3"
            >
              <span className="text-accent-300">{signal.label}:</span>
              {signal.value}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </Link>
          ) : (
            <span
              key={signal.label}
              className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-border-strong bg-white/[0.06] px-4 py-2.5 text-sm prose-body sm:w-auto sm:max-w-none sm:px-5 sm:py-3"
            >
              <span className="text-accent-300">{signal.label}:</span>
              {signal.value}
            </span>
          )
        )}
      </div>

      <div className="mt-8 flex justify-center md:mt-14">
        <TelegramButton href={siteConfig.telegram.channel} size="lg" className="w-full max-w-md sm:w-auto sm:max-w-none">
          Написать в Telegram
        </TelegramButton>
      </div>
    </Section>
  );
}
