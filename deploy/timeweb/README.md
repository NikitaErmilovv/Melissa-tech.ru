# Timeweb Apps — melissa-tech.ru

## В панели (обязательно)

1. **Тип / фреймворк:** `Dockerfile` (не автоопределение Python/Node).
2. **Путь до проекта:** пусто (корень репозитория).
3. **Порт:** `8080` (как в корневом `Dockerfile`).
4. **Health-check (если есть):** `/volgograd-kottedzh/deploy-version.txt` или `/`.

Если в логе сборки **`FROM debian:bookworm-slim`** и 14 шагов с сертификатами — платформа **не** использует наш `nginx`-Dockerfile. Переключите тип на Dockerfile и перезапустите деплой.

## Проверка после зелёного деплоя

- `https://melissa-tech.ru/volgograd-kottedzh/deploy-version.txt` → `deploy-trigger` как в GitHub `master`
- `https://melissa-tech.ru/tau-altay-cheremshanka/deploy-version.txt`

Если `last-modified` на проде не меняется после успешного деплоя — домен смотрит **не на это приложение** (старый VPS/Caddy). Тогда: `git pull` в `/var/www/melissa-tech.ru` на VPS или привязка домена к App Platform.