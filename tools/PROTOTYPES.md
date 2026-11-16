# Локальные прототипы (клон RP без 3D)

Шаблон: `Melissa-tech.ru/rp-detailing-tolyatti` (статический сайт + `python server.py`).

## Готовые сайты

| Папка | Бренд | Порт |
|-------|--------|------|
| `toner-plus-nsk` | Тонер+, Новосибирск, Стартовая 7А | 8136 |
| `ar-detailing-biysk` | AR-Detailing, Бийск, Революции 78/96 | 8137 |
| `kuzoff-tomsk` | KuzOff, Томск, ул. Пушкина 10/1 | 8138 |
| `kuzoff-tomsk-2` | KuzOff (вторая копия), тот же контент | 8139 |

Запуск из каталога сайта:

```bash
python3 server.py
```

## Пересборка из JSON

```bash
python3 Melissa-tech.ru/tools/clone-rp-site.py Melissa-tech.ru/tools/sites/toner-plus-nsk.json
python3 Melissa-tech.ru/tools/clone-rp-site.py Melissa-tech.ru/tools/sites/ar-detailing-biysk.json
python3 Melissa-tech.ru/tools/clone-rp-site.py Melissa-tech.ru/tools/sites/kuzoff-tomsk.json
python3 Melissa-tech.ru/tools/clone-rp-site.py Melissa-tech.ru/tools/sites/kuzoff-tomsk-2.json
```

Конфиги: `tools/sites/*.json` — телефоны, 2GIS, список услуг на главной, `theme_css` (для AR — чёрно-бело-красный акцент).
