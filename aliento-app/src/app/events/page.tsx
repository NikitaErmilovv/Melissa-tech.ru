import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { PartyEventsCarousel } from "@/components/PartyEventsCarousel";
import type { PartyEventCardData } from "@/components/PartyEventCard";
import { buildMetadata } from "@/lib/metadata";
import { catalogToEventItems, toPartyDate } from "@/lib/party-events";

export const metadata = buildMetadata({
  title: "Вечеринки",
  description:
    "Тематические вечеринки школы бачаты Aliento: Alien Night, Arabian Night, Hogwarts, Matrix и другие party сезона 2025–2026.",
  path: "/events",
});

function loadPartyCards(): PartyEventCardData[] {
  return catalogToEventItems()
    .map((event) => ({
      id: event.id,
      number: event.number,
      title: event.title,
      description: event.description,
      startsAt: new Date(event.startsAt),
      place: event.place,
      imageUrl: event.imageUrl,
    }))
    .sort((a, b) => toPartyDate(a.startsAt).getTime() - toPartyDate(b.startsAt).getTime());
}

export default async function EventsPage() {
  const parties = loadPartyCards();
  const now = new Date();
  const upcoming = parties.filter((e) => toPartyDate(e.startsAt) >= now);
  const featured = upcoming[0] ?? parties[parties.length - 1];

  return (
    <>
      <PageHeader
        eyebrow="Вечеринки"
        title="Тематические party Aliento"
        description="Каждая вечеринка — отдельная вселенная: dress-code, декор и атмосфера. Запись не нужна — просто приходите в указанное время."
      />

      <section className="bg-background-elevated py-12 md:py-16">
        <Container className="space-y-10">
          {featured && (
            <div className="app-card flex flex-wrap items-center justify-between gap-4 border-accent-500/20 bg-accent-500/5">
              <div>
                <p className="stat-label">{upcoming.length > 0 ? "Следующая вечеринка" : "Финал сезона"}</p>
                <p className="mt-2 font-display text-xl text-foreground md:text-2xl">{featured.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {toPartyDate(featured.startsAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {featured.place}
                </p>
              </div>
              <p className="text-sm text-accent-300">Вход для учеников школы — свободный</p>
            </div>
          )}

          <PartyEventsCarousel
            events={parties}
            title="Сезон 2025–2026"
            subtitle="Листайте плашки стрелками или свайпом. Фото каждой вечеринки — по номеру на карточке."
          />

          <div className="app-card">
            <h2 className="font-display text-xl md:text-2xl">Как это работает</h2>
            <ul className="mt-5 grid gap-4 text-sm text-muted md:grid-cols-3">
              <li className="rounded-xl border border-border bg-surface-2/60 p-4">
                <p className="font-medium text-foreground">Без записи</p>
                <p className="mt-1.5 leading-relaxed">Приходите в день вечеринки — регистрация на сайте не нужна.</p>
              </li>
              <li className="rounded-xl border border-border bg-surface-2/60 p-4">
                <p className="font-medium text-foreground">Dress-code по теме</p>
                <p className="mt-1.5 leading-relaxed">Костюм необязателен, но добавляет настроение — смотрите тему на плашке.</p>
              </li>
              <li className="rounded-xl border border-border bg-surface-2/60 p-4">
                <p className="font-medium text-foreground">Ученикам — бесплатно</p>
                <p className="mt-1.5 leading-relaxed">
                  Действующим ученикам школы вход на вечеринки Aliento свободный.
                </p>
              </li>
            </ul>
            <Link
              href="/schedule"
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent-300 link-underline"
            >
              Расписание занятий
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
