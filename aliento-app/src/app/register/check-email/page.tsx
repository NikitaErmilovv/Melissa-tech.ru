import Link from "next/link";
import { resendVerificationAction, verifyEmailCodeAction } from "@/actions/auth";
import { getSmtpStatus } from "@/actions/auth";
import { SubmitButton } from "@/components/ButtonLink";
import { VerificationCodeInput } from "@/components/VerificationCodeInput";
import { Logo } from "@/components/Logo";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Подтвердите email",
  description: "Подтверждение email после регистрации в школе Aliento.",
  path: "/register/check-email",
});

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; sent?: string; error?: string }>;
}) {
  const { email, sent, error } = await searchParams;
  const smtp = await getSmtpStatus();

  return (
    <main className="stage-light flex flex-1 items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="app-card mt-9">
          <h1 className="font-display text-2xl">Подтвердите email</h1>
          <p className="mt-2 text-sm text-muted">
            Мы отправили 6-значный код
            {email ? (
              <>
                {" "}
                на <span className="text-foreground">{email}</span>
              </>
            ) : (
              " на ваш email"
            )}
            . Введите его ниже.
          </p>

          {sent === "1" && (
            <p className="mt-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              Новый код отправлен на почту.
            </p>
          )}
          {error && (
            <p className="mt-5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          {!smtp.configured && process.env.NODE_ENV === "development" && (
            <p className="mt-5 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
              SMTP не настроен — код выводится в терминал dev-сервера.
            </p>
          )}

          <form action={verifyEmailCodeAction} className="mt-7 space-y-4">
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={email ?? ""}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="code">
                Код из письма
              </label>
              <VerificationCodeInput id="code" name="code" required />
            </div>
            <SubmitButton className="w-full">Подтвердить email</SubmitButton>
          </form>

          <form action={resendVerificationAction} className="mt-4 space-y-4">
            <input type="hidden" name="email" value={email ?? ""} />
            <SubmitButton className="w-full" variant="secondary">
              Отправить код ещё раз
            </SubmitButton>
          </form>

          <p className="mt-6 text-sm text-muted">
            Уже подтвердили?{" "}
            <Link href="/login" className="text-accent-300 link-underline">
              Войти
            </Link>
          </p>
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
