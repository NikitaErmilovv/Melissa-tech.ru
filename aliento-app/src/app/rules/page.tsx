import Script from "next/script";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { CtaBanner } from "@/components/CtaBanner";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Правила школы",
  description:
    "Правила школы бачаты Aliento: запись, опоздания, абонементы и уважение к залу и партнёрам.",
  path: "/rules",
});

function RuleBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="card-title text-lg md:text-xl">{title}</h3>
      <div className="prose-body mt-4 space-y-4">{children}</div>
    </div>
  );
}

export default function RulesPage() {
  return (
    <>
      <Script
        id="ld-breadcrumb-rules"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Главная", path: "/" },
              { name: "Правила", path: "/rules" },
            ])
          ),
        }}
      />

      <PageHeader
        eyebrow="Документы"
        title="Правила школы"
        description="Коротко о том, как мы занимаемся, чтобы в зале было спокойно, безопасно и приятно всем."
      />

      <section className="pb-16">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
            <div className="content-panel lg:p-10">
              <h2 className="font-display text-2xl font-medium md:text-[1.75rem]">Занятия и запись</h2>
              <p className="mt-2 text-xs text-muted-dim">Актуальная редакция</p>

              <div className="mt-8 space-y-8">
                <RuleBlock title="Запись">
                  <p>
                    Запись на занятия доступна из личного кабинета при активном абонементе. Место
                    подтверждается автоматически, если есть свободные слоты. При вопросах пишите в
                    Telegram школы.
                  </p>
                </RuleBlock>

                <RuleBlock title="Опоздания и отмены">
                  <p>
                    Если не получается прийти, напишите заранее. Правила переноса зависят от формата:
                    пробное занятие, разовое посещение или абонемент.
                  </p>
                </RuleBlock>

                <RuleBlock title="Абонементы">
                  <p>
                    Абонемент действует ограниченный срок и включает фиксированное число занятий.
                    Оформление и оплата — на странице{" "}
                    <Link href="/subscriptions" className="link-underline text-accent-300">
                      «Абонементы»
                    </Link>
                    . Условия возврата согласуются с администратором.
                  </p>
                </RuleBlock>

                <RuleBlock title="Одежда и зал">
                  <p>
                    Удобная одежда и обувь без агрессивного протектора. Берегите покрытие зала и
                    оставляйте верхнюю одежду в раздевалке.
                  </p>
                </RuleBlock>
              </div>
            </div>

            <div className="content-panel lg:p-10">
              <h2 className="font-display text-2xl font-medium md:text-[1.75rem]">Атмосфера</h2>
              <p className="mt-2 text-xs text-muted-dim">Уважение к партнёрам и школе</p>

              <div className="mt-8 space-y-8">
                <RuleBlock title="Партнёрство">
                  <p>
                    На групповых занятиях пары часто меняются. Танцуем бережно, спрашиваем согласие
                    на контакт и останавливаемся, если партнёру некомфортно.
                  </p>
                </RuleBlock>

                <RuleBlock title="Что не принято">
                  <ul className="list-disc space-y-2 pl-5">
                    <li>давление, грубые комментарии и неуместные замечания о теле;</li>
                    <li>съёмка других учеников без согласия;</li>
                    <li>алкоголь и агрессивное поведение в зале;</li>
                    <li>приходить на занятие с симптомами заразной болезни.</li>
                  </ul>
                </RuleBlock>

                <RuleBlock title="Связь со школой">
                  <p>
                    Вопросы по записи, оплате и расписанию — в{" "}
                    <Link
                      href={siteConfig.telegram.direct}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline text-accent-300"
                    >
                      Telegram Aliento
                    </Link>
                    .
                  </p>
                </RuleBlock>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CtaBanner
        title="Правила понятны? Приходите танцевать"
        description="Запишитесь на пробное занятие или посмотрите расписание."
      />
    </>
  );
}
