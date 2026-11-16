import { SubmitButton } from "@/components/ButtonLink";
import { requireStaff } from "@/actions/auth";
import { broadcastMessageAction } from "@/actions/admin";
import { prisma } from "@/lib/db";
import { formatDateTime, isAdmin } from "@/lib/format";
import { cn } from "@/lib/cn";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const user = await requireStaff();
  if (!isAdmin(user.role)) {
    return <p className="app-card card-body text-sm">Раздел доступен администраторам школы.</p>;
  }

  const { sent, error } = await searchParams;
  const [messages, unread, adminAlerts] = await Promise.all([
    prisma.notification.findMany({ take: 30 }),
    prisma.notification.count({ where: { read: false } }),
    prisma.notification.findMany({
      where: { userId: user.id, read: false },
      take: 10,
    }),
  ]);

  const birthdayAlerts = adminAlerts.filter((item) => item.tag?.startsWith("birthday:"));

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl md:text-3xl">Сообщения</h1>

      {error && <p className="app-card border-danger/40 text-sm text-danger">{error}</p>}
      {sent && (
        <p className="app-card text-sm text-success">Рассылка отправлена: {sent} получателей.</p>
      )}

      {birthdayAlerts.length > 0 && (
        <section className="app-card border-accent-400/30 bg-accent-500/[0.06]">
          <h2 className="app-card-title">Напоминания о днях рождения</h2>
          <ul className="mt-4 space-y-3">
            {birthdayAlerts.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="app-card">
          <p className="stat-label">Всего сообщений</p>
          <p className="stat-value">{messages.length}</p>
        </div>
        <div className="app-card">
          <p className="stat-label">Не прочитано</p>
          <p className="stat-value">{unread}</p>
        </div>
        <div className="app-card">
          <p className="stat-label">Канал</p>
          <p className="mt-2.5 font-display text-lg text-accent-300">Личный кабинет</p>
          <p className="mt-2 text-xs text-muted-dim">Email и Telegram — на следующем этапе</p>
        </div>
      </div>

      <section className="app-card">
        <h2 className="app-card-title">Новая рассылка</h2>
        <form action={broadcastMessageAction} className="mt-6 grid gap-4">
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div>
              <label className="field-label" htmlFor="title">
                Заголовок
              </label>
              <input id="title" name="title" required className="field" placeholder="Вечеринка в субботу" />
            </div>
            <div>
              <label className="field-label" htmlFor="audience">
                Кому
              </label>
              <select id="audience" name="audience" className="field" defaultValue="students">
                <option value="students">Всем ученикам</option>
                <option value="staff">Команде школы</option>
              </select>
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="body">
              Текст сообщения
            </label>
            <textarea id="body" name="body" required rows={4} className="field resize-y" />
          </div>
          <div>
            <SubmitButton>Отправить</SubmitButton>
          </div>
        </form>
      </section>

      <section className="app-card">
        <h2 className="app-card-title">Отправленные сообщения</h2>
        {messages.length === 0 ? (
          <p className="card-body mt-5 text-sm">Сообщений пока нет.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {messages.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "rounded-2xl border border-border p-4",
                  !item.read && "border-border-strong bg-accent-500/[0.07]"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-dim">{formatDateTime(item.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                <p className="mt-3 text-xs text-muted-dim">
                  Получатель: {item.user?.name ?? "—"} · {item.read ? "прочитано" : "не прочитано"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
