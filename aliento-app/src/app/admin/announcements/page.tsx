import { createAnnouncementAction, deleteAnnouncementAction } from "@/actions/announcements";
import { SubmitButton } from "@/components/ButtonLink";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminAnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) redirect("/login");

  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl text-foreground">Анонсы на главной</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          На сайте всегда показываются только 3 последних анонса. Новые добавляются сверху.
        </p>
      </div>

      <section className="app-card">
        <h2 className="app-card-title">Новый анонс</h2>
        <form action={createAnnouncementAction} className="mt-5 grid gap-4 sm:max-w-xl">
          <div>
            <label className="field-label" htmlFor="tag">
              Метка
            </label>
            <input id="tag" name="tag" className="field" placeholder="Набор" required />
          </div>
          <div>
            <label className="field-label" htmlFor="title">
              Заголовок
            </label>
            <input id="title" name="title" className="field" required />
          </div>
          <div>
            <label className="field-label" htmlFor="body">
              Текст
            </label>
            <textarea id="body" name="body" rows={4} className="field min-h-[6rem]" required />
          </div>
          <SubmitButton className="w-fit">Опубликовать</SubmitButton>
        </form>
      </section>

      <section className="app-card">
        <h2 className="app-card-title">Все анонсы ({announcements.length})</h2>
        <ul className="mt-5 space-y-4">
          {announcements.map((item) => (
            <li key={item.id} className="rounded-xl border border-border p-4">
              <p className="label-caps text-accent-300">{item.tag}</p>
              <p className="mt-2 font-medium text-foreground">{item.title}</p>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
              <form action={deleteAnnouncementAction} className="mt-4">
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="btn btn-ghost btn-sm text-danger">
                  Удалить
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
