# DNS: сайт + Resend (чеклист)

Подставьте свой домен: `crm.example.ru`, IP: `45.153.69.171`.

## CRM (Timeweb / регистратор)

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `crm` | `45.153.69.171` |
| A | `@` | `45.153.69.171` | *(если CRM с корня)* |

## Resend (копировать из кабинета Domains → ваш домен)

Обычно 3–4 записи, **точные значения только из Resend**:

| Тип | Назначение |
|-----|------------|
| TXT | SPF / domain verification |
| CNAME | DKIM (несколько, если даны) |
| CNAME / MX | Return-path / bounce (если Resend просит) |

Пока статус **Unverified** — поставьте в `.env` пустой `RESEND_API_KEY` (письма не уходят, ссылка на экране при регистрации).

## После A-записи

```bash
sudo certbot --nginx -d crm.example.ru
systemctl restart autoblesk
```

## Проверка

```bash
curl -s https://crm.example.ru/api/build-info | jq .mail
```

`resendConfigured: true` — после вставки `RESEND_API_KEY` в `.env`.