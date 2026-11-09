import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "./Container";
import { PartyEventsCarousel } from "./PartyEventsCarousel";
import type { PartyEventCardData } from "./PartyEventCard";
import { toPartyDate } from "@/lib/party-events";

export function EventsSection({ events }: { events: PartyEventCardData[] }) {
  const parties = events
    .filter((e) => e.number !== undefined)
    .sort((a, b) => toPartyDate(a.startsAt).getTime() - toPartyDate(b.startsAt).getTime());

  return (
    <section className="bg-background py-14 md:py-20">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl">Вечеринки Aliento</h2>
            <p className="mt-2 text-sm text-muted">Тематические party сезона — листайте плашки и выбирайте образ.</p>
          </div>
          <Link
            href="/events"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-accent-300 link-underline"
          >
            Все вечеринки
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8">
          <PartyEventsCarousel events={parties} compact />
        </div>
      </Container>
    </section>
  );
}
