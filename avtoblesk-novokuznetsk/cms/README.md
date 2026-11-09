# CMS АвтоБлеск

## Вход

**Продакшен:** https://autoblesk42.ru/cms/admin-panel.html  
**Локально:** http://127.0.0.1:8092/cms/admin-panel.html

Один пароль на всю панель (статьи, страницы, 3D, **учёт школы**). Отдельные логины у «Владислав», «Сергей» и т.д. в разделе школы — это записи в `data/training.json` для CRM, **не** вход в систему.

| Ситуация | Пароль |
|----------|--------|
| На сервере есть `cms/config.local.json` | тот, что вы задали в файле |
| Файла нет (первый деплой или только `config.example`) | `avtoblesk-cms-change-me` из `config.example.json` |

На Timeweb создайте `config.local.json` со своим паролем (в git не попадает). Скрипт `scripts/deploy-avtoblesk-vps.sh` **не затирает** этот файл при `rsync --delete` и при первом деплое копирует example → local, если local ещё нет.

```json
{ "password": "ваш-секретный-пароль" }
```

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
