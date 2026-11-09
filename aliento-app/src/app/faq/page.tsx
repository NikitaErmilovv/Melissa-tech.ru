import Script from "next/script";
import { PageHeader } from "@/components/PageHeader";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CtaBanner } from "@/components/CtaBanner";
import { Section } from "@/components/Section";
import { faqData, getFaqByCategory } from "@/lib/faq-data";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/json-ld";

export const metadata = buildMetadata({
  title: "Вопросы и ответы о школе бачаты",
  description:
    "Ответы на частые вопросы о школе Aliento: пробное занятие, абонементы, расписание, одежда и преподаватели.",
  path: "/faq",
});

const groups = [
  { category: "general" as const, title: "Общие вопросы" },
  { category: "schedule" as const, title: "Расписание и запись" },
  { category: "teachers" as const, title: "Преподаватели" },
];

export default function FaqPage() {
  return (
    <>
      <Script
        id="ld-breadcrumb-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Главная", path: "/" },
              { name: "FAQ", path: "/faq" },
            ])
          ),
        }}
      />
      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqData)) }}
      />

      <PageHeader
        eyebrow="FAQ"
        title="Вопросы и ответы о школе Aliento"
        description="Всё, что обычно спрашивают перед первым занятием: формат, запись и преподаватели."
      />

      <Section tone="elevated" className="pt-0 md:pt-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-12 md:gap-16">
          {groups.map((group) => (
            <div key={group.category}>
              <h2 className="font-display text-2xl font-medium md:text-[1.75rem]">{group.title}</h2>
              <div className="mt-6 md:mt-8">
                <FaqAccordion items={getFaqByCategory(group.category)} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
