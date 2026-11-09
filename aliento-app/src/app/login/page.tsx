import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { SubmitButton } from "@/components/ButtonLink";
import { Logo } from "@/components/Logo";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Вход",
  description: "Вход в личный кабинет школы бачаты Aliento.",
  path: "/login",
});

const testAccounts = [
  { role: "Владелец", email: "owner@aliento.test" },
  { role: "Администратор", email: "admin@aliento.test" },
  { role: "Преподаватель", email: "anastasia@aliento.test" },
  { role: "Ученик (тест)", email: "student@aliento.test" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="stage-light flex flex-1 items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <form action={loginAction} className="app-card mt-9">
          <h1 className="font-display text-2xl">Вход в кабинет</h1>
          <p className="mt-2 text-sm text-muted">
            Расписание, абонемент и записи — в одном месте.
          </p>

          {message && (
            <p className="mt-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-7 grid gap-4">
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="field"
              />
            </div>
            <p className="text-right text-sm">
              <Link href="/forgot-password" className="text-accent-300 link-underline">
                Забыли пароль?
              </Link>
            </p>
          </div>

          <div className="mt-7">
            <SubmitButton className="w-full">Войти</SubmitButton>
          </div>

          <p className="mt-6 text-sm text-muted">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-accent-300 link-underline">
              Регистрация
            </Link>
          </p>
        </form>

        <div className="app-card mt-4">
          <p className="stat-label">Тестовые доступы · пароль aliento123</p>
          <ul className="mt-4 space-y-2.5">
            {testAccounts.map((account) => (
              <li key={account.email} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted">{account.role}</span>
                <span className="text-accent-300">{account.email}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-muted link-underline">
            Вернуться на сайт
          </Link>
        </p>
      </div>
    </main>
  );
}
