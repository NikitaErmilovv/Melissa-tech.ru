import { j as e, r as a, t as E, L as p } from "./index-BqucrLDD.js";
import { C as k, a as D, b as R, c as A } from "./card-Ffjp1IHA.js";
import { B as h } from "./button-BYhsRed0.js";
import { c as f } from "./utils-Bk382tBs.js";
import { P as K } from "./const-CL7-dg2c.js";

const inputCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

function FieldInput({ className, type, ...props }) {
  return e.jsxDEV("input", { type, className: f(inputCls, className), ...props }, void 0, !1, {}, void 0);
}

function FieldLabel({ className, ...props }) {
  return e.jsxDEV(
    "label",
    { className: f("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className), ...props },
    void 0,
    !1,
    {},
    void 0,
  );
}

function RegisterPage() {
  const [step, setStep] = a.useState("account");
  const [ownerName, setOwnerName] = a.useState("");
  const [email, setEmail] = a.useState("");
  const [phone, setPhone] = a.useState("");
  const [password, setPassword] = a.useState("");
  const [code, setCode] = a.useState("");
  const [devCode, setDevCode] = a.useState(null);
  const [completionToken, setCompletionToken] = a.useState("");
  const [studioName, setStudioName] = a.useState("");
  const [city, setCity] = a.useState("");
  const [address, setAddress] = a.useState("");
  const [legalName, setLegalName] = a.useState("");
  const [inn, setInn] = a.useState("");
  const [err, setErr] = a.useState(null);

  const startRegistration = E.auth.startRegistration.useMutation({
    onSuccess: (s) => {
      setErr(null);
      setDevCode(s.devCode ?? null);
      setStep("code");
    },
    onError: (s) => setErr(s.message),
  });

  const verifyRegistrationCode = E.auth.verifyRegistrationCode.useMutation({
    onSuccess: (s) => {
      setErr(null);
      setCompletionToken(s.completionToken);
      setStep("org");
    },
    onError: (s) => setErr(s.message),
  });

  const completeRegistration = E.auth.completeRegistration.useMutation({
    onSuccess: async (s) => {
      if (s.token) sessionStorage.setItem(K, s.token);
      setErr(null);
      window.location.assign("/");
    },
    onError: (s) => setErr(s.message),
  });

  let stepBody = null;
  if (step === "account") {
    stepBody = e.jsxDEV(
      e.Fragment,
      {
        children: [
          e.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Шаг 1 из 3 — ваши контакты и пароль. Код придёт на email." }, void 0, !1, {}, void 0),
          e.jsxDEV("div", { className: "space-y-2", children: [e.jsxDEV(FieldLabel, { children: "Ваше имя" }, void 0, !1, {}, void 0), e.jsxDEV(FieldInput, { value: ownerName, onChange: (s) => setOwnerName(s.target.value) }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0),
          e.jsxDEV("div", { className: "space-y-2", children: [e.jsxDEV(FieldLabel, { children: "Email" }, void 0, !1, {}, void 0), e.jsxDEV(FieldInput, { type: "email", value: email, onChange: (s) => setEmail(s.target.value) }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0),
          e.jsxDEV("div", { className: "space-y-2", children: [e.jsxDEV(FieldLabel, { children: "Телефон" }, void 0, !1, {}, void 0), e.jsxDEV(FieldInput, { value: phone, onChange: (s) => setPhone(s.target.value) }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0),
          e.jsxDEV("div", { className: "space-y-2", children: [e.jsxDEV(FieldLabel, { children: "Пароль (от 8 символов)" }, void 0, !1, {}, void 0), e.jsxDEV(FieldInput, { type: "password", value: password, onChange: (s) => setPassword(s.target.value) }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0),
          e.jsxDEV(
            h,
            {
              className: "w-full",
              disabled: startRegistration.isPending,
              onClick: () => startRegistration.mutate({ ownerName, email, phone: phone || void 0, password }),
              children: startRegistration.isPending ? "Отправляем код…" : "Получить код",
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
    );
  } else if (step === "code") {
    stepBody = e.jsxDEV(
      e.Fragment,
      {
        children: [
          e.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Шаг 2 — введите код из письма." }, void 0, !1, {}, void 0),
          devCode
            ? e.jsxDEV("p", { className: "rounded-xl bg-muted px-3 py-2 text-sm font-mono", children: ["Код для теста: ", e.jsxDEV("strong", { children: devCode }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0)
            : null,
          e.jsxDEV("div", { className: "space-y-2", children: [e.jsxDEV(FieldLabel, { children: "Код подтверждения" }, void 0, !1, {}, void 0), e.jsxDEV(FieldInput, { inputMode: "numeric", maxLength: 6, value: code, onChange: (s) => setCode(s.target.value.replace(/\D/g, "").slice(0, 6)) }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0),
          e.jsxDEV(h, { className: "w-full", disabled: verifyRegistrationCode.isPending, onClick: () => verifyRegistrationCode.mutate({ email, code }), children: verifyRegistrationCode.isPending ? "Проверяем…" : "Подтвердить код" }, void 0, !1, {}, void 0),
          e.jsxDEV(h, { variant: "outline", className: "w-full", onClick: () => setStep("account"), children: "Назад" }, void 0, !1, {}, void 0),
        ],
      },
      void 0,
      !0,
      {},
      void 0,
    );
  } else {
    stepBody = e.jsxDEV(
      e.Fragment,
      {
        children: [
          e.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Шаг 3 — данные организации. После продолжения откроется кабинет с демо-данными." }, void 0, !1, {}, void 0),
          e.jsxDEV("div", { className: "space-y-2", children: [e.jsxDEV(FieldLabel, { children: "Название студии" }, void 0, !1, {}, void 0), e.jsxDEV(FieldInput, { value: studioName, onChange: (s) => setStudioName(s.target.value) }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0),
          e.jsxDEV("div", { className: "space-y-2", children: [e.jsxDEV(FieldLabel, { children: "Город" }, void 0, !1, {}, void 0), e.jsxDEV(FieldInput, { value: city, onChange: (s) => setCity(s.target.value) }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0),
          e.jsxDEV("div", { className: "space-y-2", children: [e.jsxDEV(FieldLabel, { children: "Адрес" }, void 0, !1, {}, void 0), e.jsxDEV(FieldInput, { value: address, onChange: (s) => setAddress(s.target.value) }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0),
          e.jsxDEV("div", { className: "space-y-2", children: [e.jsxDEV(FieldLabel, { children: "Юр. название (необязательно)" }, void 0, !1, {}, void 0), e.jsxDEV(FieldInput, { value: legalName, onChange: (s) => setLegalName(s.target.value) }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0),
          e.jsxDEV("div", { className: "space-y-2", children: [e.jsxDEV(FieldLabel, { children: "ИНН (необязательно)" }, void 0, !1, {}, void 0), e.jsxDEV(FieldInput, { value: inn, onChange: (s) => setInn(s.target.value) }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0),
          e.jsxDEV(
            h,
            {
              className: "w-full",
              disabled: completeRegistration.isPending,
              onClick: () =>
                completeRegistration.mutate({
                  email,
                  completionToken,
                  studioName,
                  city: city || void 0,
                  address: address || void 0,
                  legalName: legalName || void 0,
                  inn: inn || void 0,
                }),
              children: completeRegistration.isPending ? "Создаём кабинет…" : "Продолжить в личный кабинет",
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
    );
  }

  return e.jsxDEV(
    "div",
    {
      className: "min-h-screen flex items-center justify-center bg-[#FAF7F1] px-4 py-10",
      children: e.jsxDEV(
        k,
        {
          className: "w-full max-w-md",
          children: [
            e.jsxDEV(
              D,
              {
                children: [
                  e.jsxDEV(R, { children: "Регистрация студии" }, void 0, !1, {}, void 0),
                  e.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Самостоятельная регистрация. Суперадмин получит уведомление." }, void 0, !1, {}, void 0),
                ],
              },
              void 0,
              !0,
              {},
              void 0,
            ),
            e.jsxDEV(
              A,
              {
                className: "space-y-4",
                children: [
                  err ? e.jsxDEV("p", { className: "text-sm text-destructive", children: err }, void 0, !1, {}, void 0) : null,
                  stepBody,
                  e.jsxDEV("p", { className: "text-center text-sm", children: ["Уже есть аккаунт? ", e.jsxDEV(p, { to: "/login", className: "font-bold text-[var(--red)]", children: "Войти" }, void 0, !1, {}, void 0)] }, void 0, !0, {}, void 0),
                ],
              },
              void 0,
              !0,
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
    },
    void 0,
    !1,
    {},
    void 0,
  );
}

export { RegisterPage as default };
