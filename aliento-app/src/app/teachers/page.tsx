import { PageHeader } from "@/components/PageHeader";
import { Container } from "@/components/Container";
import { Avatar } from "@/components/Avatar";
import { CtaBanner } from "@/components/CtaBanner";
import { buildMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/db";
import { formatTime } from "@/lib/format";
import { publicTeachers } from "@/lib/teachers-public";

export const metadata = buildMetadata({
  title: "Преподаватели",
  description: "Преподаватели Aliento: Валентина Ситник, Кристина Алпатова, Иван Мазуренко, Роман Данилов.",
  path: "/teachers",
});

export default async function TeachersPage() {
  const [dbTeachers, classes] = await Promise.all([
    prisma.teacher.findMany(),
    prisma.danceClass.findMany({ where: { startsAt: { gte: new Date() } } }),
  ]);

  const teacherByName = new Map(dbTeachers.map((t) => [t.user.name, t]));

  return (
    <>
      <PageHeader
        eyebrow="Команда"
        title="Преподаватели школы"
        description="Мы объясняем спокойно и по делу: сначала база и ощущение партнёра, потом стиль и импровизация."
      />

      <section className="bg-background-elevated py-12 md:py-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {publicTeachers.map((teacher) => {
              const dbTeacher = teacherByName.get(teacher.name);
              const upcoming = dbTeacher
                ? classes.filter((c) => c.teacherId === dbTeacher.id).slice(0, 3)
                : [];

              return (
                <article key={teacher.name} className="app-card flex flex-col">
                  <div className="flex items-center gap-4">
                    <Avatar name={teacher.name} size="lg" />
                    <div className="min-w-0">
                      <h2 className="font-display text-lg text-foreground">{teacher.name}</h2>
                      <p className="mt-1.5 text-sm text-accent-300">{teacher.title}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-muted">{teacher.description}</p>

                  <div className="mt-6 border-t border-border pt-5">
                    <p className="stat-label">Ближайшие занятия</p>
                    {upcoming.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-dim">Занятия скоро появятся в расписании.</p>
                    ) : (
                      <ul className="mt-3 space-y-2.5">
                        {upcoming.map((item) => (
                          <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate text-foreground">{item.title}</span>
                            <span className="shrink-0 text-xs text-muted">
                              {item.startsAt.toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "short",
                              })}{" "}
                              · {formatTime(item.startsAt)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <CtaBanner
        title="Хотите заниматься индивидуально?"
        description="Напишите нам — подберём преподавателя и удобное время."
        primaryLabel="Записаться"
        secondaryLabel="Смотреть расписание"
        secondaryHref="/schedule"
      />
    </>
  );
}
