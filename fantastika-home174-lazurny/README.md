# Fantastika_home174

Аренда гостевого дома / коттеджа, пос. Лазурный (Челябинская область).

Локально на **ноутбуке**: `python server.py` → http://127.0.0.1:8135/

С **телефона** в той же сети (раздача с телефона на ноутбук): см. [PHONE-PREVIEW.md](./PHONE-PREVIEW.md) или `serve-phone.bat` (Windows).

2ГИС: https://2gis.ru/chelyabinsk/geo/70000001098642477

Отзывы и фото — из карточки 2ГИС (`data/reviews-2gis.json`, `img/works/incoming/fantastika/`).

## Прод и выкладка (Timeweb)

Статический сайт, без сборки: папка `fantastika-home174-lazurny/` в монорепо [Melissa-tech.ru](https://github.com/NikitaErmilovv/Melissa-tech.ru).

- Прод: https://melissa-tech.ru/fantastika-home174-lazurny/
- Выкладка: изменения → обновить `deploy-version.txt` (здесь и в корне репо при необходимости) → `git push origin master` → Timeweb подтягивает `master` (как у «Прямые руки»: `deploy-push.bat` в родительской папке репо).
- Убедиться, что на проде новая версия: `https://melissa-tech.ru/fantastika-home174-lazurny/deploy-version.txt` — строка `deploy-trigger` должна совпасть с файлом в GitHub `master`.
- Если push прошёл, а `deploy-trigger` на проде старый — в Timeweb запустите деплой вручную и проверьте привязку репозитория/ветки `master`.
