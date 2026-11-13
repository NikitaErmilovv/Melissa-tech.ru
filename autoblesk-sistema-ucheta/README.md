# Система учёта АвтоБлеск (снимок с Wise Corvus)

Импорт с VPS Timeweb `45.153.69.171`, `/opt/autoblesk` (2026-11-13). На сервере **только production-сборка** (`dist/boot.js` + SPA), исходников Vite в репозитории нет.

## Локальный запуск (БД через SSH-туннель на прод)

**Внимание:** при таком запуске приложение пишет в **ту же MariaDB, что и прод**. Серверные файлы не трогаем, но заказы/клиенты в БД меняются. Для безопасных правок позже нужен локальный дамп БД.

1. Скопируйте `.env.example` → `opt-autoblesk/.env` и подставьте значения с сервера (файл `opt-autoblesk/.env` в git не коммитится).
2. Node.js 22+
3. `./scripts/run-local.sh`
4. http://127.0.0.1:3000/ — вход для разработки: `/api/dev/preview-login`

## Прод на сервере

- `systemctl status autoblesk`
- nginx → `127.0.0.1:3000`

## GitHub

Целевой отдельный репозиторий: [NikitaErmilovv/autoblesk-crm](https://github.com/NikitaErmilovv/autoblesk-crm) (обновите зеркалом из этой папки, если push с агента недоступен).
