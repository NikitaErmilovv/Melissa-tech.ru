import { Container } from "@/components/Container";
import { MessengerButtons } from "@/components/landing/MessengerButtons";
import { homeScheduleRows } from "@/lib/landing-content";

export function HomeScheduleSection({ bookHref = "#book" }: { bookHref?: string }) {
  return (
    <section id="schedule" className="bg-background py-14 md:py-20">
      <Container>
        <h2 className="font-display text-2xl text-foreground md:text-3xl">Расписание</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Актуальные группы и время. Чтобы попасть —{" "}
          <a href={bookHref} className="text-accent-300 link-underline">
            напишите нам
          </a>
          .
        </p>

        <div className="mt-8 space-y-3">
          {homeScheduleRows.map((row) => (
            <article key={row.id} className="content-panel">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-base text-foreground md:text-lg">{row.title}</h3>
                  <p className="mt-1 text-sm text-accent-300">{row.when}</p>
                </div>
                <MessengerButtons size="sm" message={row.bookMessage} className="shrink-0" />
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
