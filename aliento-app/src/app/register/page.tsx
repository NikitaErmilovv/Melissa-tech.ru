import Link from "next/link";
import { registerAction } from "@/actions/auth";
import { SubmitButton } from "@/components/ButtonLink";
import { MaskedBirthDateInput } from "@/components/MaskedBirthDateInput";
import { MaskedPhoneInput } from "@/components/MaskedPhoneInput";
import { Logo } from "@/components/Logo";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Регистрация",
  description: "Создайте аккаунт в школе бачаты Aliento и запишитесь на занятие.",
  path: "/register",
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="stage-light flex flex-1 items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <form action={registerAction} className="app-card mt-9">
          <h1 className="font-display text-2xl">Запись в школу</h1>
          <p className="mt-2 text-sm text-muted">
            Создайте аккаунт — на email придёт ссылка для подтверждения. После этого можно записываться на
            занятия.
          </p>

          {error && (
            <p className="mt-5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-7 grid gap-4">
            <div>
              <label className="field-label" htmlFor="name">
                ФИО
              </label>
              <input
                id="name"
                name="name"
                required
                autoComplete="name"
                placeholder="Иванова Анна Сергеевна"
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="dateOfBirth">
                Дата рождения
              </label>
              <MaskedBirthDateInput id="dateOfBirth" name="dateOfBirth" required />
            </div>
            <div>
              <label className="field-label" htmlFor="phone">
                Телефон
              </label>
              <MaskedPhoneInput id="phone" name="phone" required />
            </div>
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" required autoComplete="email" className="field" />
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
                minLength={6}
                autoComplete="new-password"
                className="field"
              />
              <p className="mt-2 text-xs text-muted-dim">Минимум 6 символов.</p>
            </div>
          </div>

          <div className="mt-7">
            <SubmitButton className="w-full">Создать аккаунт</SubmitButton>
          </div>

          <p className="mt-6 text-sm text-muted">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-accent-300 link-underline">
              Войти
            </Link>
          </p>

          <p className="mt-4 text-xs text-muted-dim">
            Регистрируясь, вы соглашаетесь с{" "}
            <Link href="/terms" className="link-underline">
              пользовательским соглашением
            </Link>
            ,{" "}
            <Link href="/privacy" className="link-underline">
              политикой конфиденциальности
            </Link>{" "}
            и{" "}
            <Link href="/rules" className="link-underline">
              правилами школы
            </Link>
            .
          </p>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-muted link-underline">
            Вернуться на сайт
          </Link>
        </p>
      </div>
    </main>
  );
}
