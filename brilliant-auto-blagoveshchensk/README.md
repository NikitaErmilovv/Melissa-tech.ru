# Brilliant auto — Благовещенск

- **Адрес:** г. Благовещенск, 50 лет Октября улица, 167
- **Телефоны:** +7 (914) 605-53-53, +7 (914) 615 49-14
- **2ГИС:** https://2gis.ru/blagoveshensk/firm/70000001090035899

## Локальный запуск

Из папки `brilliant-auto-blagoveshchensk`:

- Windows: двойной клик по `start.bat` или в cmd: `start.bat`
- Linux/macOS: `python3 server.py`

Сайт: http://127.0.0.1:8090/

## Деплой (melissa-tech.ru)

Публикуется только **`master`**, папка `brilliant-auto-blagoveshchensk/`.  
На главной блок услуг — **`photo-strip`** (подписи ЗАЩИТНАЯ ПЛЁНКА, ЗАМЕНА ЦВЕТА…), не карточки с длинным текстом (это была ветка `cursor/brilliant-auto-v2`).

```bat
cd ..\
brilliant-auto-blagoveshchensk\deploy-push.bat
```

После push на сервере: `git pull origin master` в каталоге сайта (если автодеплой не настроен).
