# Прямые руки 55

Локально: `python server.py` → http://127.0.0.1:8133/

Прод: https://melissa-tech.ru/pryamye-ruki-55-omsk/  
Актуальная сборка (GitHub Pages, пока VPS не обновлён): https://nikitaermilovv.github.io/Melissa-tech.ru/pryamye-ruki-55-omsk/

2ГИС: https://2gis.ru/omsk/firm/70000001069922155

Шаблон: prime38-detailing-angarsk. Фото альбома: 16 из 2ГИС.

## Деплой на melissa-tech.ru

Код в **master** есть; домен отдаёт **VPS** (Caddy). Обновление — Action **Deploy melissa-tech.ru (rsync)** или `scripts/deploy-pryamye-rsync.sh` с вашего ПК. Нужен секрет **`DEPLOY_SSH_KEY`** (приватный ключ `root@185.84.163.45`) в GitHub → Settings → Secrets → Actions. Без него каждый push падает на rsync, Timeweb-hook прод не подтягивает.
