import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Button, Field } from '../ui.jsx';
import MaskedPhoneInput from '../components/MaskedPhoneInput.jsx';
import VerificationCodeInput from '../components/VerificationCodeInput.jsx';
import SideRays from '../components/SideRays.jsx';
import LegalEntityFooter from '../components/LegalEntityFooter.jsx';

export default function LoginPage({ onSession, go }) {
  const [mode, setMode] = useState('login');
  const [registerStep, setRegisterStep] = useState('form');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', code: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setError('');
    setInfo('');
  }, [mode]);

  useEffect(() => {
    if (mode !== 'register') setRegisterStep('form');
  }, [mode]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'forgot') {
        await api.forgot(form.email);
        setInfo('Если почта есть в кабинете, ссылка для сброса записана на сервере.');
        return;
      }
      if (mode === 'login') {
        onSession(await api.login(form.email, form.password));
        return;
      }
      if (registerStep === 'form') {
        const result = await api.registerStart(form);
        setRegisterStep('verify');
        if (result.devCode) {
          setForm((prev) => ({ ...prev, code: result.devCode }));
          setInfo(`Письмо не отправлено (SMTP). Код: ${result.devCode}`);
        } else if (result.previewCode) {
          setForm((prev) => ({ ...prev, code: result.previewCode }));
          setInfo(`Код ${result.previewCode} уже подставлен. Письмо ушло с этого же ящика Яндекса — во «Входящих» его часто нет, смотри папку «Отправленные» (тема: Melissa Tech — код ${result.previewCode}).`);
        } else if (result.emailSent === false) {
          setInfo('Письмо не ушло. Проверьте почту или нажмите «Отправить код повторно».');
        } else {
          setInfo('Код отправили. Проверьте почту и «Спам».');
        }
        return;
      }
      const session = await api.registerVerify({ ...form, code: form.code });
      onSession(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmLater = async () => {
    setBusy(true);
    setError('');
    try {
      const session = await api.registerConfirmLater(form);
      onSession(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070709]">
      <div className="absolute inset-0" aria-hidden="true">
        <SideRays
          speed={2.5}
          rayColor1="#EAB308"
          rayColor2="#96c8ff"
          intensity={2}
          spread={2}
          origin="top-right"
          tilt={0}
          saturation={1.5}
          blend={0.75}
          falloff={1.6}
          opacity={1}
        />
      </div>
      <div className="relative z-10 min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px] animate-fade-up">
          <form onSubmit={submit} className="signin-card">
            <img className="signin-mark" src="/favicon.svg" alt="" />
            <h1 className="signin-title">
              {mode === 'forgot' ? 'Восстановление' : mode === 'register' ? 'Регистрация' : 'Вход'}
            </h1>
            <p className="signin-sub">
              {mode === 'forgot'
                ? 'Пришлём ссылку на почту, если кабинет уже есть.'
                : mode === 'register'
                  ? 'Регистрация в панели управления.'
                  : 'Вход в панель управления.'}
            </p>

            <div className="signin-fields">
              {mode === 'register' && registerStep === 'form' && (
                <>
                  <label className="signin-field">
                    <span>ФИО</span>
                    <input className="signin-input" value={form.name} onChange={set('name')} autoComplete="name" required placeholder="Иванов Иван Иванович" />
                  </label>
                  <label className="signin-field">
                    <span>Телефон</span>
                    <MaskedPhoneInput
                      className="signin-input"
                      value={form.phone}
                      onChange={(phone) => setForm((prev) => ({ ...prev, phone }))}
                      required
                    />
                  </label>
                </>
              )}
              {(mode !== 'register' || registerStep === 'form') && (
                <label className="signin-field">
                  <span>Почта</span>
                  <input className="signin-input" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
                </label>
              )}
              {mode === 'register' && registerStep === 'verify' && (
                <label className="signin-field">
                  <span>Код из письма</span>
                  <VerificationCodeInput
                    className="signin-input text-center text-2xl tracking-[0.35em] font-heading"
                    value={form.code}
                    onChange={(code) => setForm((prev) => ({ ...prev, code }))}
                  />
                  <span className="signin-hint">6 цифр, действует 30 минут</span>
                </label>
              )}
              {mode !== 'forgot' && (mode !== 'register' || registerStep === 'form') && (
                <label className="signin-field">
                  <span className="signin-label-row">
                    <span>Пароль</span>
                    {mode === 'login' && (
                      <button type="button" className="signin-link" onClick={() => setMode('forgot')}>Забыли пароль?</button>
                    )}
                  </span>
                  <span className="signin-password">
                    <input
                      className="signin-input"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      required
                      placeholder="введите пароль"
                    />
                    <button
                      type="button"
                      className="signin-eye"
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      onClick={() => setShowPassword((open) => !open)}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
                        {showPassword ? (
                          <path d="M3 3l18 18M10.5 10.7A3 3 0 0 0 12 15a3 3 0 0 0 2.3-1.1M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.2 9.5 7-0.4 1.1-1.2 2.4-2.3 3.6M6.1 6.4C4.3 7.7 3 9.5 2.5 12c1 2.8 4.5 7 9.5 7 1.1 0 2.1-.2 3.1-.6" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <>
                            <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12Z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </span>
                </label>
              )}
            </div>

            {error && (
              <p className="mt-5 rounded-2xl bg-[#ff6b6b]/12 border border-[#ff6b6b]/25 px-4 py-3 font-body text-[#ff8f8f] text-sm">
                {error}
              </p>
            )}
            {info && (
              <p className="mt-5 rounded-2xl bg-[#a8e6c8]/10 border border-[#a8e6c8]/25 px-4 py-3 font-body text-[#a8e6c8] text-sm">
                {info}
              </p>
            )}

            <button type="submit" className="signin-submit" disabled={busy}>
              {busy ? 'Секунду…' : mode === 'forgot' ? 'Отправить ссылку' : mode === 'login' ? 'Войти' : registerStep === 'verify' ? 'Подтвердить код' : 'Создать кабинет'}
            </button>

            {mode === 'register' && registerStep === 'verify' && (
              <div className="mt-3 flex flex-col gap-2">
                <Button type="button" variant="ghost" size="sm" className="w-full" disabled={busy} onClick={confirmLater}>
                  Подтвердить позже
                </Button>
                <p className="font-body text-xs text-white/35 text-center">Кабинет откроется сейчас; письмо с паролем — только после ввода кода.</p>
                <button
                  type="button"
                  className="font-body text-xs text-white/40 hover:text-white/65"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError('');
                    try {
                      const result = await api.registerStart(form);
                      setRegisterStep('verify');
                      setForm((prev) => ({ ...prev, code: '' }));
                      if (result.devCode || result.previewCode) {
                        const shown = result.devCode || result.previewCode;
                        setForm((prev) => ({ ...prev, code: shown }));
                        setInfo(result.previewCode
                          ? `Новый код ${shown}. Письмо самому себе — в «Отправленных», не во «Входящих».`
                          : `Код: ${shown}`);
                      } else if (result.emailSent === false) {
                        setInfo('Письмо не ушло. Проверьте почту и попробуйте ещё раз через минуту.');
                      } else setInfo('Новый код отправлен. Проверь «Входящие» и «Спам».');
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Отправить код повторно
                </button>
                <button
                  type="button"
                  className="font-body text-xs text-white/40 hover:text-white/65"
                  onClick={() => {
                    setRegisterStep('form');
                    setForm((prev) => ({ ...prev, code: '' }));
                  }}
                >
                  Изменить данные
                </button>
              </div>
            )}

            {mode === 'login' && (
              <p className="signin-foot">
                Нет аккаунта?{' '}
                <button type="button" className="signin-link" onClick={() => setMode('register')}>Создать</button>
                {' · '}
                <button type="button" className="signin-link" onClick={() => go('/pricing')}>Тарифы</button>
              </p>
            )}
            {mode === 'register' && registerStep === 'form' && (
              <p className="signin-foot">
                Уже есть аккаунт?{' '}
                <button type="button" className="signin-link" onClick={() => setMode('login')}>Войти</button>
              </p>
            )}
            {mode === 'forgot' && (
              <p className="signin-foot">
                <button type="button" className="signin-link" onClick={() => setMode('login')}>Вернуться ко входу</button>
              </p>
            )}
          </form>
        </div>
      </div>
      <LegalEntityFooter go={go} />
      </div>
    </div>
  );
}

export function ResetPage({ go }) {
  const token = new URLSearchParams(window.location.search).get('token') || '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.reset(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="glass-panel w-full max-w-md rounded-[1.75rem] p-6 md:p-7 space-y-4 animate-fade-up">
        <p className="title-xl text-white text-xl">новый пароль</p>
        {done ? (
          <p className="font-body text-sm text-white/70">Пароль обновлён. Войдите с новой парой.</p>
        ) : (
          <>
            <Field label="Пароль" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" hint="От 8 символов, с буквами и цифрами." required />
            {error && (
              <p className="rounded-2xl bg-[#ff6b6b]/12 border border-[#ff6b6b]/25 px-4 py-3 font-body text-[#ff8f8f] text-sm">{error}</p>
            )}
            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={busy}>{busy ? 'Секунду…' : 'Сохранить'}</Button>
          </>
        )}
        <button type="button" className="font-body text-xs text-white/40 hover:text-white/65" onClick={() => go('/login')}>Ко входу</button>
      </form>
    </div>
  );
}
