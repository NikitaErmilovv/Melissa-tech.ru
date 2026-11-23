# Деплой на Timeweb

## Репозиторий на GitHub

**Сейчас залито сюда (есть push):**  
https://github.com/NikitaErmilovv/Melissa-tech.ru — ветка с папкой **`aliento-app/`** (коммит `cursor/aliento-live-8ce1`).

Репозиторий **NikitaErmilovv/Aliento** с этой машины **не обновлялся** (у агента нет write).

### В Timeweb Cloud

1. Репозиторий: **Melissa-tech.ru**
2. Ветка: **master** (после мержа PR) или **cursor/aliento-live-8ce1**
3. **Корневая папка / Build context:** `aliento-app`
4. Build: `npm ci && npm run build`
5. Start: `npm run start` (или как у вас в шаблоне Node)

### Данные после первого деплоя

В консоли приложения один раз:

```bash
rm -f data/aliento.json
```

Перезапуск — создастся база из `data/aliento.initial.json` (твои ученики + staff).

Дальше живёт только **`data/aliento.json`** на диске — бэкапьте файл перед деплоем.
