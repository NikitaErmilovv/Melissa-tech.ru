import { q as queryClient, d as clearOffline, r as react, t as trpc, j as e, L as Link } from "./index-BqucrLDD.js";
import { P as SESSION_KEY } from "./const-CL7-dg2c.js";

async function resetClientCache() {
  await queryClient.cancelQueries();
  queryClient.clear();
  try {
    await clearOffline("REACT_QUERY_OFFLINE_CACHE");
  } catch {}
}

function LoginPage() {
  const [busy, setBusy] = react.useState(false);
  const [error, setError] = react.useState(null);
  const [login, setLogin] = react.useState("");
  const [password, setPassword] = react.useState("");
  const [demoCabinet, setDemoCabinet] = react.useState(false);

  react.useEffect(() => {
    fetch("/api/build-info")
      .then((r) => r.json())
      .then((info) => setDemoCabinet(Boolean(info.demoCabinet)))
      .catch(() => setDemoCabinet(false));
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      if (data.token) sessionStorage.setItem(SESSION_KEY, data.token);
      await resetClientCache();
      window.location.assign(data.user.role === "superadmin" ? "/platform" : "/");
    },
    onError: (err) => {
      setError(err.message);
      setBusy(false);
    },
  });

  async function previewLogin(role = "owner") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dev/preview-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Ошибка входа (${res.status})`);
      }
      const data = await res.json();
      if (data.token) sessionStorage.setItem(SESSION_KEY, data.token);
      await resetClientCache();
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
      setBusy(false);
    }
  }

  return e.jsxDEV(
    "div",
    {
      className: "flex min-h-screen items-center justify-center bg-[#FAF7F1] px-4 py-10",
      children: e.jsxDEV(
        "div",
        {
          className: "card-soft w-full max-w-sm px-6 py-8",
          children: [
            e.jsxDEV(
              "div",
              {
                className: "text-center",
                children: [
                  e.jsxDEV("h1", { className: "font-display text-2xl", children: "Detail Desk" }, void 0, !1, {}, void 0),
                  e.jsxDEV("p", { className: "mt-1 text-sm font-medium text-muted-foreground", children: "Учёт детейлинг-студии" }, void 0, !1, {}, void 0),
                ],
              },
              void 0,
              !0,
              {},
              void 0,
            ),
            e.jsxDEV(
              "div",
              {
                className: "mt-6 space-y-3",
                children: [
                  e.jsxDEV(
                    "label",
                    {
                      className: "block text-xs font-bold uppercase tracking-wide text-muted-foreground",
                      children: [
                        "Логин",
                        e.jsxDEV("input", {
                          className: "input-warm mt-1 font-normal normal-case",
                          value: login,
                          onChange: (ev) => setLogin(ev.target.value),
                          autoComplete: "username",
                        }, void 0, !1, {}, void 0),
                      ],
                    },
                    void 0,
                    !0,
                    {},
                    void 0,
                  ),
                  e.jsxDEV(
                    "label",
                    {
                      className: "block text-xs font-bold uppercase tracking-wide text-muted-foreground",
                      children: [
                        "Пароль",
                        e.jsxDEV("input", {
                          type: "password",
                          className: "input-warm mt-1 font-normal normal-case",
                          value: password,
                          onChange: (ev) => setPassword(ev.target.value),
                          autoComplete: "current-password",
                        }, void 0, !1, {}, void 0),
                      ],
                    },
                    void 0,
                    !0,
                    {},
                    void 0,
                  ),
                  e.jsxDEV(
                    "button",
                    {
                      type: "button",
                      className: "btn-primary h-12 w-full",
                      disabled: busy || loginMutation.isPending,
                      onClick: () => {
                        setBusy(true);
                        loginMutation.mutate({ login, password });
                      },
                      children: loginMutation.isPending ? "Вход…" : "Войти",
                    },
                    void 0,
                    !1,
                    {},
                    void 0,
                  ),
                  e.jsxDEV(
                    "p",
                    {
                      className: "text-center text-sm",
                      children: e.jsxDEV(Link, { to: "/register", className: "font-bold text-[var(--red)]", children: "Регистрация организации" }, void 0, !1, {}, void 0),
                    },
                    void 0,
                    !1,
                    {},
                    void 0,
                  ),
                ],
              },
              void 0,
              !0,
              {},
              void 0,
            ),
            demoCabinet
              ? e.jsxDEV(
                  "div",
                  {
                    className: "mt-6 space-y-2 border-t border-[var(--line)] pt-5",
                    children: [
                      e.jsxDEV("p", { className: "text-center text-xs font-bold uppercase tracking-wide text-muted-foreground", children: "Тестовый кабинет" }, void 0, !1, {}, void 0),
                      e.jsxDEV("p", { className: "text-center text-xs text-muted-foreground", children: "Демо-данные, не привязаны к реальным студиям" }, void 0, !1, {}, void 0),
                      e.jsxDEV(
                        "button",
                        { type: "button", className: "btn-primary h-12 w-full", disabled: busy, onClick: () => previewLogin("owner"), children: "Владелец (тест)" },
                        void 0,
                        !1,
                        {},
                        void 0,
                      ),
                      e.jsxDEV(
                        "button",
                        { type: "button", className: "btn-ghost h-12 w-full", disabled: busy, onClick: () => previewLogin("employee"), children: "Сотрудник (тест)" },
                        void 0,
                        !1,
                        {},
                        void 0,
                      ),
                      e.jsxDEV("p", { className: "pt-2 text-center text-xs text-muted-foreground", children: "Суперадмин — только поля логина и пароля выше" }, void 0, !1, {}, void 0),
                    ],
                  },
                  void 0,
                  !0,
                  {},
                  void 0,
                )
              : null,
            error ? e.jsxDEV("p", { className: "mt-4 text-center text-sm font-medium text-[var(--red)]", children: error }, void 0, !1, {}, void 0) : null,
          ],
        },
        void 0,
        !0,
        {},
        void 0,
      ),
    },
    void 0,
    !1,
    {},
    void 0,
  );
}

export { LoginPage as default };
