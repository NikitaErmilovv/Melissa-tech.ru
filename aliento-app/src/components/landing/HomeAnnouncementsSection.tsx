import { Container } from "@/components/Container";

export type HomeAnnouncement = {
  id: string;
  tag: string;
  title: string;
  body: string;
};

export function HomeAnnouncementsSection({ items }: { items: HomeAnnouncement[] }) {
  return (
    <section id="announcements" className="bg-background-elevated py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl text-foreground md:text-3xl">Анонсы</h2>
          <p className="mt-2 text-sm text-muted">Наборы групп и ближайшие события сезона.</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="content-panel">
              <p className="label-caps text-accent-300">{item.tag}</p>
              <h3 className="mt-3 font-display text-lg text-foreground">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
