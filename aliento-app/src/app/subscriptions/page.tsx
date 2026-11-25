import { PageHeader } from "@/components/PageHeader";
import { MarketingLandingSections } from "@/components/landing/MarketingLandingSections";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Абонементы",
  description:
    "Тарифы Aliento: пробное занятие, абонементы по часам. Запись и оформление — в Telegram или Max.",
  path: "/subscriptions",
});

export default function SubscriptionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Абонементы"
        title="Абонементы и занятия"
        description="Тарифы, расписание, зал и атмосфера школы — всё, что на главной, собрано здесь для удобства."
      />
      <MarketingLandingSections bookHref="/#book" />
    </>
  );
}
