# Почта Resend (коды и уведомления)

Письма уходят **с вашего домена** (`noreply@ваш-домен`), как в типичной схеме с Resend.

## 1. Resend

1. [resend.com](https://resend.com) → **Domains** → Add domain.
2. Добавьте в DNS у регистратора **все** записи из Resend (SPF, DKIM, иногда MX/return-path).
3. Дождитесь статуса **Verified**.
4. **API Keys** → Create → ключ вида `re_...` (храните только в `.env` на сервере).

## 2. DNS сайта (параллельно с Resend)

- **A** `@` (и при необходимости `www`) → `45.153.69.171`
- После проверки: `certbot --nginx -d ваш-домен.ru`

## 3. Переменные на VPS (`/opt/autoblesk/.env`)

```bash
# Публичный URL CRM (обязательно https после сертификата)
PUBLIC_APP_URL=https://crm.ваш-домен.ru

# Resend
RESEND_API_KEY=re_xxxxxxxx

# Отправитель — только с верифицированного домена в Resend
MAIL_FROM=Авто Блеск <noreply@ваш-домен.ru>
```

Перезапуск:

```bash
systemctl restart autoblesk
```

## 4. Проверка без отправки письма

```bash
curl -s https://ваш-домен/api/build-info
```

Ожидается:

```json
"mail": {
  "resendConfigured": true,
  "from": "Авто Блеск <noreply@...>",
  "publicAppUrl": "https://..."
}
```

Пока `RESEND_API_KEY` пустой — при регистрации ссылка подтверждения **показывается на экране** (как сейчас). После ключа — письмо на почту, ссылка на экране скрывается.

## 5. Тестовая регистрация

1. `/register` — заявка с реальным email.
2. Письмо «Подтвердите email — Авто Блеск».
3. Клик → `/verify-email?token=...` → суперадмин видит заявку в очереди.

Скрипт-заготовка для `.env`: `scripts/apply-mail-env.example.sh`

Полный блок переменных: `deploy/env.mail.template`  
DNS-чеклист: `deploy/RESEND-DNS.checklist.md`  
Проверка: `scripts/resend-preflight.sh https://crm.ваш-домен`

### Какие письма уже подключены

| Событие | Когда уходит |
|---------|----------------|
| Подтверждение email | Регистрация организации |
| Студия подключена | Суперадмин одобрил заявку |
| Доступ сотруднику | Выдача доступа, если указан email |
| Новый пароль | Сброс пароля в платформе, если у пользователя есть email |