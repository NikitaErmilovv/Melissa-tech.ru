# CMS АвтоБлеск

## Вход

**Прод:** https://melissa-tech.ru/avtoblesk-novokuznetsk/cms/admin-panel.html  
**Локально:** http://127.0.0.1:8092/cms/admin-panel.html  

Пароль по умолчанию — в `config.example.json`. На сервере создайте `config.local.json` (в git не попадает):

```json
{ "password": "ваш-секретный-пароль" }
```

## Панель CMS

- **Альбомы работ** — блоки по услугам (как Brilliant Auto), загрузка фото/видео, сохранение в `content.json`.
- **Услуги** — список на `services.html`.
- **Страницы сайта** — открыть страницу: внизу панель inline-редактирования (текст, фото, hero, до/после).

## Галерея

Страница `gallery.html`: секции `work-block` с сеткой `g--media` и lightbox (`gallery-lightbox.js`).

## API

| Окружение | Сохранение |
|-----------|------------|
| `python server.py` | `/api/cms/*` |
| Timeweb (PHP) | `cms/api.php?action=login|save|upload` |

После правок на статике без PHP можно закоммитить `cms/content.json` и файлы из `img/cms/uploads/`.
