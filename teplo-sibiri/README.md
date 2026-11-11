# Тепло Сибири

Сайт на шаблоне RP: дрова, горбыль, калькулятор объёма и заявка.

## Локально

```bash
cd teplo-sibiri
python3 server.py
```

http://127.0.0.1:8157/

## Настройки

Все телефоны, цены и `orderWebhook` — в **`site-config.js`**.

Сейчас заявка открывает **WhatsApp** с готовым текстом. Когда будет API/SMS — укажите `orderWebhook`.

## Прод (melissa-tech.ru)

Папка: `teplo-sibiri/`. После push обновите `deploy-version.txt` и выкладывайте `master` на Timeweb.
