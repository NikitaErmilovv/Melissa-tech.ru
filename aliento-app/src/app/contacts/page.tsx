import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { HomeLocationSection } from "@/components/landing/HomeLocationSection";
import { MessengerButtons } from "@/components/landing/MessengerButtons";
import { buildMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/db";

export const metadata = buildMetadata({
  title: "Контакты",
  description: "Контакты Aliento: адрес на проспекте Карла Маркса, телефон, маршрут в 2ГИС.",
  path: "/contacts",
});

export default async function ContactsPage() {
  const settings = await prisma.settings.get();

  return (
    <>
      <PageHeader
        eyebrow="Контакты"
        title="Как с нами связаться"
        description="Адрес, телефон и маршрут — как на главной. По записи и тарифам напишите в Telegram или Max."
      />

      <HomeLocationSection hours={settings.hours} />

      <section className="bg-background pb-14 md:pb-20">
        <Container className="flex justify-center">
          <MessengerButtons size="md" />
        </Container>
      </section>
    </>
  );
}
