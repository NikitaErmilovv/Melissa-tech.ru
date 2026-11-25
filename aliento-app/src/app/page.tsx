import Script from "next/script";
import { HomeBookSection } from "@/components/landing/HomeBookSection";
import { MarketingLandingSections } from "@/components/landing/MarketingLandingSections";
import { buildMetadata } from "@/lib/metadata";
import { webPageJsonLd } from "@/lib/json-ld";

export const metadata = buildMetadata({
  title: "Aliento — танцевальное пространство",
  description:
    "Бачата и кизомба в Новосибирске. Приходите на пробное — дальше расскажем про группы, абонементы и вечеринки.",
  path: "",
});

export default async function Home() {
  return (
    <>
      <Script
        id="ld-homepage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webPageJsonLd({
              name: "Aliento — танцевальное пространство",
              description:
                "Бачата и кизомба в Новосибирске. Приходите на пробное — дальше расскажем про группы, абонементы и вечеринки.",
              path: "",
            })
          ),
        }}
      />

      <HomeBookSection />
      <MarketingLandingSections bookHref="#book" />
    </>
  );
}
