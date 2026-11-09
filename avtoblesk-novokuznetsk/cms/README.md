# CMS АвтоБлеск

## Вход по ролям

**Продакшен:** https://autoblesk42.ru/cms/admin-panel.html  
**Локально:** http://127.0.0.1:8092/cms/admin-panel.html

Почта и пароль — из `cms/staff.json` (если файла нет, берётся `cms/staff.example.json`). Пароли в git-примере:

| Роль | Что видит | Почта | Пароль |
|------|-----------|-------|--------|
| Администратор | Сайт и вся школа | `vlad@avtoblesk.ru` | `AvtoAdmin` |
| Преподаватель | Ученики, зачёты, курсы | `kovalev@avtoblesk.ru`, `guskov@avtoblesk.ru` | `AvtoTeacher` |
| Менеджер | Заявки (ученики), курсы, статистика | `lapteva@avtoblesk.ru` | `AvtoManager` |
| Стажёр | Только просмотр школы | `demin@avtoblesk.ru` | `AvtoIntern` |

Свои пароли — копия `staff.example.json` → `staff.json` на сервере (в git не входит, деплой его не затирает). Пустая почта и пароль из `config.local.json` по-прежнему открывают полный доступ администратора сайта.

## Панель CMS

- **Альбомы работ** — блоки по услугам, загрузка фото/видео, сохранение в `content.json`.
- **Услуги** — список на `services.html`.
- **Страницы сайта** — открыть страницу: внизу панель правок (текст, фото, скрытие блоков).
- **Конфигуратор 3D** — цены и названия зон отдельно для легкового и кроссовера, палитра, финиш.
- **Школа** — курсы, ученики, сертификаты (`data/training.json`). Демо-ученики перед выкладкой удалены.

## Галерея

Страница `gallery.html`: секции `work-block` с сеткой `g--media` и lightbox (`gallery-lightbox.js`).

## API

| Окружение | Сохранение |
|-----------|------------|
| `python server.py` | `/api/cms/*` |
| Timeweb (PHP) | `cms/api.php?action=login\|save\|upload` плюс `wrap-zones-save`, `training-save` |

После правок на статике без PHP можно закоммитить `cms/content.json` и файлы из `img/cms/uploads/`.
