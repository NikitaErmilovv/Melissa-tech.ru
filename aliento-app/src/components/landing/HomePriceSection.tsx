import { Container } from "@/components/Container";
import { MessengerButtons } from "@/components/landing/MessengerButtons";
import { homePriceRows } from "@/lib/landing-content";
import { trialMaxUrl, trialTelegramUrl } from "@/lib/messengers";

export function HomePriceSection({ bookHref = "#book" }: { bookHref?: string }) {
  return (
    <section id="price" className="bg-background-elevated py-14 md:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-2xl text-foreground md:text-3xl">Цена</h2>
          <p className="mb-5 mt-2 text-center text-sm text-muted">
            Ориентир по тарифам. Оформление — в переписке после{" "}
            <a href={bookHref} className="text-accent-300 link-underline">
              сообщения в Telegram или Max
            </a>
            .
          </p>

          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-32px_rgba(0,0,0,0.65)]">
            {homePriceRows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7 md:py-6"
              >
                <div className="min-w-0">
                  <h3 className="font-display text-lg text-foreground md:text-xl">{row.title}</h3>
                  {row.description ? (
                    <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">{row.description}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                  <p className="font-display text-2xl tabular-nums text-foreground md:text-[1.75rem]">
                    {row.price}
                  </p>
                  {"showMessengers" in row && row.showMessengers && (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <a
                        href={trialTelegramUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm inline-flex items-center justify-center gap-2"
                      >
                        Telegram
                      </a>
                      <a
                        href={trialMaxUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm inline-flex items-center justify-center gap-2"
                      >
                        Max
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl justify-center">
          <MessengerButtons />
        </div>
      </Container>
    </section>
  );
}
