# Melissa-tech.ru

Монорепозиторий прототипов сайтов для деплоя на один сервер (основной домен + поддомены).

## Сайты

| Папка | Описание |
|-------|----------|
| `skolov38/` | Детейлинг Сколов38 — статический сайт (HTML/CSS/JS) |
| `ds7/` | Детейлинг DS7, Нижний Новгород — статический сайт (HTML/CSS/JS) |
| `ps-detailing/` | PS Detailing, Хабаровск — статический сайт (HTML/CSS/JS) |
| `kgcustom/` | Kgcustom, Красноярск — автосервис и детейлинг (HTML/CSS/JS) |
| `gorillaz-studios/` | Gorillaz Studios, Новосибирск — детейлинг (HTML/CSS/JS) |
| `makcar/` | MakCar, Омск — кузовной ремонт и покраска (HTML/CSS/JS) |
| `sdc-detailing/` | SDC Detailing, Южно-Сахалинск — детейлинг (HTML/CSS/JS) |

## Локальный запуск (skolov38)

```bash
cd skolov38
python server.py
```

Открыть: http://127.0.0.1:8082/

Статика без Python: `python -m http.server 8082` (рейтинг 2GIS останется запасным значением).

## Локальный запуск (ds7)

```bash
cd ds7
python server.py
```

Открыть: http://127.0.0.1:8083/

## Локальный запуск (ps-detailing)

```bash
cd ps-detailing
python server.py
```

Открыть: http://127.0.0.1:8084/

## Локальный запуск (kgcustom)

```bash
cd kgcustom
python server.py
```

Открыть: http://127.0.0.1:8085/

## Локальный запуск (gorillaz-studios)

```bash
cd gorillaz-studios
python server.py
```

Открыть: http://127.0.0.1:8086/

## Локальный запуск (makcar)

```bash
cd makcar
python server.py
```

Открыть: http://127.0.0.1:8087/

## Локальный запуск (sdc-detailing)

```bash
cd sdc-detailing
python server.py
```

Открыть: http://127.0.0.1:8088/
