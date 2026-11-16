import { Avatar } from "@/components/Avatar";
import { SubmitButton } from "@/components/ButtonLink";
import { MaskedPhoneInput } from "@/components/MaskedPhoneInput";
import { requireStudent } from "@/actions/auth";
import { updateProfileAction } from "@/actions/studio";
import { prisma } from "@/lib/db";
import { formatDate, formatMonthYear } from "@/lib/format";
import { formatBirthdayFull } from "@/lib/birthdays";

export default async function CabinetProfilePage() {
  const session = await requireStudent();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
  const activeSub = user.subscriptions.find((s) => s.status === "ACTIVE") ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <section className="app-card">
        <h2 className="app-card-title">Личные данные</h2>
        <form action={updateProfileAction} className="mt-6 grid gap-5">
          <div>
            <label className="field-label" htmlFor="name">
              ФИО
            </label>
            <input
              id="name"
              name="name"
              defaultValue={user.name}
              required
              className="field"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="phone">
              Телефон
            </label>
            <MaskedPhoneInput
              id="phone"
              name="phone"
              defaultValue={user.phone}
              required
            />
          </div>
          <div>
            <label className="field-label">Дата рождения</label>
            <input
              defaultValue={user.dateOfBirth ? formatBirthdayFull(user.dateOfBirth) : "—"}
              disabled
              className="field opacity-60"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input id="email" defaultValue={user.email} disabled className="field opacity-60" />
            <p className="mt-2 text-xs text-muted-dim">
              Email — логин в системе. Для смены напишите администратору.
            </p>
          </div>
          <div>
            <SubmitButton>Сохранить изменения</SubmitButton>
          </div>
        </form>
      </section>

      <section className="app-card">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0">
            <p className="font-display text-lg text-foreground">{user.name}</p>
            <p className="mt-1 text-sm text-muted">Ученик школы</p>
          </div>
        </div>

        <ul className="panel-list mt-6">
          <li className="justify-between">
            <span className="text-sm text-muted">С нами с</span>
            <span className="text-sm text-foreground">{formatMonthYear(user.createdAt)}</span>
          </li>
          <li className="justify-between">
            <span className="text-sm text-muted">Абонемент</span>
            <span className="text-sm text-foreground">{activeSub?.plan.name ?? "Нет активного"}</span>
          </li>
          <li className="justify-between">
            <span className="text-sm text-muted">Действует до</span>
            <span className="text-sm text-foreground">
              {activeSub ? formatDate(activeSub.expiresAt) : "—"}
            </span>
          </li>
          <li className="justify-between">
            <span className="text-sm text-muted">Записей всего</span>
            <span className="text-sm text-foreground">{user.bookings.length}</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
