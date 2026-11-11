"use client";

import { useState } from "react";

const accounts = [
  { role: "владельца", email: "owner@aliento.test" },
  { role: "администратора", email: "admin@aliento.test" },
  { role: "преподавателя", email: "anastasia@aliento.test" },
  { role: "ученика", email: "student@aliento.test" },
] as const;

const TEST_PASSWORD = "aliento123";

type Props = {
  password?: string;
};

export function QuickLoginPanel({ password = TEST_PASSWORD }: Props) {
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function quickLogin(email: string) {
    setError(null);
    setLoadingEmail(email);
    try {
      const body = new FormData();
      body.set("email", email);
      body.set("password", password);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        body,
        credentials: "include",
        redirect: "manual",
      });

      if (res.status === 303 || res.status === 302 || res.status === 307) {
        const target = res.headers.get("Location");
        window.location.href = target ?? (email.includes("student") ? "/cabinet" : "/admin");
        return;
      }

      if (res.redirected && res.url) {
        window.location.href = res.url;
        return;
      }

      if (res.status === 404) {
        setError(
          "На сервере старая версия без /api/auth/login. Введите email и пароль вручную в форму выше."
        );
        return;
      }
      setError("Не удалось войти. Попробуйте форму выше или обновите сайт на Timeweb.");
    } catch {
      setError("Ошибка сети при входе. Обновите страницу и попробуйте снова.");
    } finally {
      setLoadingEmail(null);
    }
  }

  return (
    <div className="app-card mt-4">
      <p className="stat-label">Быстрый вход · пароль {password}</p>
      <p className="mt-2 text-xs text-muted">Одно нажатие — без копирования email в форму выше.</p>
      <ul className="mt-4 space-y-2">
        {accounts.map((account) => (
          <li key={account.email}>
            <button
              type="button"
              disabled={loadingEmail !== null}
              onClick={() => quickLogin(account.email)}
              className="btn btn-secondary w-full justify-center text-sm disabled:opacity-60"
            >
              {loadingEmail === account.email ? "Входим…" : `Войти как ${account.role}`}
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
