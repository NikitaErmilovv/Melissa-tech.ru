import { SubmitButton } from "@/components/ButtonLink";
import { requireStudent } from "@/actions/auth";
import { markNotificationsReadAction } from "@/actions/studio";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

export default async function CabinetNotificationsPage() {
  const user = await requireStudent();
  const items = await prisma.notification.findMany({ where: { userId: user.id } });
  const unread = items.filter((n) => !n.read).length;

  return (
    <section className="app-card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="app-card-title">Сообщения школы</h2>
          <p className="mt-1.5 text-xs text-muted">
            {unread > 0 ? `${unread} непрочитанных` : "Все сообщения прочитаны"}
          </p>
        </div>
        {unread > 0 && (
          <form action={markNotificationsReadAction}>
            <SubmitButton variant="secondary" size="sm">
              Отметить прочитанными
            </SubmitButton>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <p className="card-body mt-5 text-sm">Сообщений пока нет.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
