import Link from "next/link";
import { resetPasswordAction } from "@/actions/auth";
import { SubmitButton } from "@/components/ButtonLink";
import { Logo } from "@/components/Logo";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Новый пароль",
  description: "Смена пароля в личном кабинете Aliento.",
  path: "/reset-password",
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (!token) {
    return (
      <main className="stage-light flex flex-1 items-center justify-center px-4 py-14">
        <div className="app-card w-full max-w-md">
          <h1 className="font-display text-2xl">Ссылка недействительна</h1>
          <p className="mt-2 text-sm text-muted">Запросите новое письмо для смены пароля.</p>
          <p className="mt-6 text-sm">
            <Link href="/forgot-password" className="text-accent-300 link-underline">
              Забыли пароль
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="stage-light flex flex-1 items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <form action={resetPasswordAction} className="app-card mt-9">
          <h1 className="font-display text-2xl">Новый пароль</h1>
          <p className="mt-2 text-sm text-muted">Придумайте новый пароль для входа в кабинет.</p>

          {error && (
            <p className="mt-5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <input type="hidden" name="token" value={token} />

          <div className="mt-7 grid gap-4">
            <div>
              <label className="field-label" htmlFor="password">
                Новый пароль
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
            </div>
            <div>
              <label className="field-label" htmlFor="confirm">
                Повторите пароль
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="field"
              />
            </div>
          </div>

          <div className="mt-7">
            <SubmitButton className="w-full">Сохранить пароль</SubmitButton>
          </div>
        </form>
      </div>
    </main>
  );
}
