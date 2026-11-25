# Timeweb Apps — melissa-tech.ru

Статический монорепо: деплой через **Dockerfile** в корне (nginx:8080).

После `git push origin master` в панели ждите **успешный** деплой (не останавливайте повторные пока идёт сборка).

Проверка:

- `https://melissa-tech.ru/volgograd-kottedzh/deploy-version.txt`
- `https://melissa-tech.ru/tau-altay-cheremshanka/deploy-version.txt`

`deploy-trigger` = `deploy/timeweb/BUILD_STAMP`.