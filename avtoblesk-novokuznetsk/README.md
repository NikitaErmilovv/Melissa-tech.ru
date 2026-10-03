# АвтоБлеск — Новокузнецк

- **Адрес:** г. Новокузнецк, Аульская улица, 65В
- **Телефон:** +7 (923) 532-26-52
- **2ГИС:** https://2gis.ru/novokuznetsk/firm/70000001098503533

## Локальный запуск

`python server.py` → http://127.0.0.1:8092/

Страница альбома: http://127.0.0.1:8092/album.html (редактируется во вкладке «Альбомы работ» в CMS).

CMS: http://127.0.0.1:8092/cms/admin-panel.html — подробности в `cms/README.md`

## Выкладка на Timeweb

1. Загрузите **всю папку сайта** (`index.html`, `cms/`, `data/`, `img/`, `models/` и остальное) в корень сайта или в подкаталог, например `public_html/` или `public_html/avtoblesk-novokuznetsk/`.
2. На хостинге должен быть **PHP 8+**. Python (`server.py`) на Timeweb не нужен — вход и сохранение идут через `cms/api.php`.
3. В файловом менеджере Timeweb создайте `cms/config.local.json` (этот файл в git не кладётся):

```json
{ "password": "придумайте-сложный-пароль" }
```

4. Права на запись (обычно `775` или через «права» в панели) для:
   - `cms/` (content.json, сессии)
   - `data/` (training.json, wrap-zones.json)
   - `img/cms/uploads/`
5. Откройте `https://ваш-домен/.../cms/admin-panel.html`, войдите с паролем из `config.local.json`.
6. Проверьте: сохранение альбома, конфигуратора, добавление ученика.

Не выкладывайте `cms/config.local.json` в публичный репозиторий. `.htaccess` закрывает скачивание пароля и сессий по HTTP.
