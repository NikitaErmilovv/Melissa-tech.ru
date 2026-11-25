import Link from "next/link";
import { requestPasswordResetAction } from "@/actions/auth";
import { SubmitButton } from "@/components/ButtonLink";
import { Logo } from "@/components/Logo";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Забыли пароль",
  description: "Восстановление доступа к личному кабинету Aliento.",
  path: "/forgot-password",
});

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; sent?: string; error?: string }>;
}) {
  const { email, sent, error } = await searchParams;

  return (
    <main className="stage-light flex flex-1 items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <form action={requestPasswordResetAction} className="app-card mt-9">
          <h1 className="font-display text-2xl">Забыли пароль?</h1>
          <p className="mt-2 text-sm text-muted">
            Укажите email — отправим ссылку для смены пароля.
          </p>

          {sent === "1" && (
            <p className="mt-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              Если аккаунт с этим email существует, мы отправили письмо
              {email ? (
                <>
                  {" "}
                  на <span className="text-foreground">{email}</span>
                </>
              ) : null}
              .
            </p>
          )}

          {error && (
            <p className="mt-5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-7">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={email ?? ""}
              className="field"
            />
          </div>

          <div className="mt-7">
            <SubmitButton className="w-full">Отправить ссылку</SubmitButton>
          </div>

          <p className="mt-6 text-sm text-muted">
            <Link href="/login" className="text-accent-300 link-underline">
              Вернуться ко входу
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
