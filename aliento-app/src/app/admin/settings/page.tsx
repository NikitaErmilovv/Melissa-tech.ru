import { SubmitButton } from "@/components/ButtonLink";
import { requireStaff } from "@/actions/auth";
import { grantTeacherRoleAction, updateSettingsAction } from "@/actions/admin";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/format";

const ROLE_RULES = [
  { role: "Владелец", text: "Полный доступ: настройки, тарифы, платежи, роли и статистика." },
  { role: "Администратор", text: "Ученики, занятия, абонементы, платежи, рассылки и отметки посещений." },
  { role: "Преподаватель", text: "Расписание, свои занятия, ученики и отметки посещений. Без финансов и настроек." },
  { role: "Ученик", text: "Личный кабинет: запись на занятия, абонемент и сообщения." },
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await requireStaff();
  if (!isAdmin(user.role)) {
    return <p className="app-card card-body text-sm">Раздел доступен администраторам школы.</p>;
  }

  const { saved, error } = await searchParams;
  const [settings, staff] = await Promise.all([
    prisma.settings.get(),
    prisma.user.findMany({ where: { roleIn: ["TEACHER", "ADMIN", "OWNER"] } }),
  ]);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl md:text-3xl">Настройки</h1>

      {error && <p className="app-card border-danger/40 text-sm text-danger">{error}</p>}
      {saved && <p className="app-card text-sm text-success">Настройки сохранены.</p>}

      <section className="app-card">
        <h2 className="app-card-title">Данные школы</h2>
        <form action={updateSettingsAction} className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="schoolName">
              Название школы
            </label>
            <input id="schoolName" name="schoolName" defaultValue={settings.schoolName} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="slogan">
              Слоган
            </label>
            <input id="slogan" name="slogan" defaultValue={settings.slogan} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="phone">
              Телефон
            </label>
            <input id="phone" name="phone" defaultValue={settings.phone} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" defaultValue={settings.email} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="address">
              Адрес
            </label>
            <input id="address" name="address" defaultValue={settings.address} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="hours">
              Часы работы
            </label>
            <input id="hours" name="hours" defaultValue={settings.hours} className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="cancelHours">
              Отмена записи не позднее, часов
            </label>
            <input
              id="cancelHours"
              name="cancelHours"
              type="number"
              min={0}
              defaultValue={settings.cancelHours}
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="trialPriceRub">
              Стоимость пробного занятия, ₽
            </label>
            <input
              id="trialPriceRub"
              name="trialPriceRub"
              type="number"
              min={0}
              step={100}
              defaultValue={settings.trialPriceRub}
              className="field"
            />
          </div>
          <div className="md:col-span-2">
            <SubmitButton>Сохранить настройки</SubmitButton>
          </div>
        </form>
      </section>

      <section className="app-card">
        <h2 className="app-card-title">Выдать роль преподавателя</h2>
        <p className="mt-2 text-sm text-muted">
          Укажите email существующего пользователя — он получит доступ к админ-панели с правами
          преподавателя. Тестовый аккаунт: anastasia@aliento.test / aliento123
        </p>
        <form action={grantTeacherRoleAction} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="field-label" htmlFor="teacherEmail">
              Email пользователя
            </label>
            <input
              id="teacherEmail"
              name="email"
              type="email"
              required
              placeholder="teacher@example.com"
              className="field"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="teacherTitle">
              Специализация
            </label>
            <input id="teacherTitle" name="title" defaultValue="Преподаватель" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="teacherDescription">
              Описание
            </label>
            <input
              id="teacherDescription"
              name="description"
              defaultValue="Преподаватель школы Aliento."
              className="field"
            />
          </div>
          <div className="md:col-span-2">
            <SubmitButton>Назначить преподавателем</SubmitButton>
          </div>
        </form>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="app-card">
          <h2 className="app-card-title">Команда школы</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="data-table min-w-[420px]">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th className="text-right">Роль</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((person) => (
                  <tr key={person.id}>
                    <td className="text-foreground">{person.name}</td>
                    <td>{person.email}</td>
                    <td className="text-right">
                      <span className="badge badge-accent">
                        {person.role === "OWNER"
                          ? "Владелец"
                          : person.role === "ADMIN"
                            ? "Администратор"
                            : "Преподаватель"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="app-card">
          <h2 className="app-card-title">Права ролей</h2>
          <ul className="panel-list mt-4">
            {ROLE_RULES.map((rule) => (
              <li key={rule.role}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                <span>
                  <span className="text-sm text-foreground">{rule.role}. </span>
                  <span className="text-sm text-muted">{rule.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
