import { Container } from "@/components/Container";
import { PartyEventCard, type PartyEventCardData } from "@/components/PartyEventCard";
import { toPartyDate } from "@/lib/party-events";
import { STUDIO_VENUE_LABEL } from "@/lib/messengers";

function sortParties(events: PartyEventCardData[]) {
  return [...events].sort(
    (a, b) => toPartyDate(a.startsAt).getTime() - toPartyDate(b.startsAt).getTime()
  );
}

export function HomePartiesSection({ events }: { events: PartyEventCardData[] }) {
  const sorted = sortParties(events);
  const initial = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const hasMore = rest.length > 0;

  return (
    <section id="parties" className="bg-background py-14 md:py-20">
      <Container>
        <div>
          <h2 className="font-display text-2xl md:text-3xl">Вечеринки</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Тематические party сезона: своя атмосфера, dress-code и место встретиться вне урока.
          </p>
        </div>

        {hasMore && (
          <input
            type="checkbox"
            id="parties-show-all"
            className="peer sr-only"
            aria-label="Показать все вечеринки сезона"
          />
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {initial.map((event) => (
            <PartyEventCard
              key={event.id}
              event={{ ...event, place: STUDIO_VENUE_LABEL }}
              interactivePhotos
              className="h-full"
            />
          ))}
        </div>

        {hasMore && (
          <>
            <div className="mt-5 hidden grid-cols-1 gap-5 peer-checked:grid sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((event) => (
                <PartyEventCard
                  key={event.id}
                  event={{ ...event, place: STUDIO_VENUE_LABEL }}
                  interactivePhotos
                  className="h-full"
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <label
                htmlFor="parties-show-all"
                className="btn btn-secondary cursor-pointer peer-checked:hidden"
              >
                Все вечеринки
              </label>
              <label
                htmlFor="parties-show-all"
                className="btn btn-secondary hidden cursor-pointer peer-checked:inline-flex"
              >
                Свернуть
              </label>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
