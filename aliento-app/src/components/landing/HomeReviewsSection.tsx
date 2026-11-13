import { Container } from "@/components/Container";
import { homeReviews } from "@/lib/landing-content";

export function HomeReviewsSection() {
  return (
    <section id="reviews" className="bg-background py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl text-foreground md:text-3xl">Отзывы</h2>
          <p className="mt-2 text-sm text-muted">
            Отзывы учеников на{" "}
            <a
              href="https://2gis.ru/novosibirsk/firm/70000001116531788/tab/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-300 link-underline"
            >
              2ГИС
            </a>
            .
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {homeReviews.map((item) => (
            <blockquote key={item.name} className="content-panel">
              <p className="text-sm leading-relaxed text-muted">“{item.text}”</p>
              <footer className="mt-5 text-sm font-medium text-foreground">{item.name}</footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </section>
  );
}
