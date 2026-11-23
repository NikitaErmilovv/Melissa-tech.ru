import { PageHeader } from "@/components/PageHeader";
import { MarketingLandingSections } from "@/components/landing/MarketingLandingSections";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "О школе",
  description: "Aliento — бачата и кизомба в Новосибирске: направления, зал, вечеринки, цены и контакты.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="О школе"
        title="Aliento — танцевальное пространство"
        description="Бачата и кизомба, комьюнити, зал у метро Студенческая и жизнь танца вне урока."
      />
      <MarketingLandingSections bookHref="/#book" />
    </>
  );
}
