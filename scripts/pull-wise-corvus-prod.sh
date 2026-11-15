#!/usr/bin/env bash
# Скачать проект «Система учёта» / сайт с VPS Wise Corvus (Timeweb) и положить в репозиторий.
# Перед первым запуском: доступ по SSH (пароль root из панели или ключ в ~/.ssh/wise_corvus на сервере).
set -euo pipefail

HOST="${WISE_CORVUS_HOST:-root@45.153.69.171}"
SSH_KEY="${WISE_CORVUS_SSH_KEY:-$HOME/.ssh/wise_corvus}"
DEST="${WISE_CORVUS_DEST:-$(cd "$(dirname "$0")/.." && pwd)/wise-corvus-prod}"

# Типичные пути на Timeweb VPS — скрипт подставит первый существующий.
REMOTE_CANDIDATES=(
  /var/www
  /var/www/html
  /var/www/autoblesk42
  /var/www/sistema-ucheta
  /opt/app
  /root/app
)

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15)
if [[ -f "$SSH_KEY" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY" -o IdentitiesOnly=yes)
fi

echo "→ Проверка SSH: $HOST"
if ! ssh "${SSH_OPTS[@]}" "$HOST" "hostname && uname -a"; then
  echo "Не удалось подключиться. С панели Timeweb: ssh root@45.153.69.171" >&2
  echo "Добавьте на сервер ключ: $(dirname "$0")/../docs/wise_corvus.pub (или cat ~/.ssh/wise_corvus.pub)" >&2
  exit 1
fi

REMOTE_DIR="${WISE_CORVUS_REMOTE_DIR:-}"
if [[ -z "$REMOTE_DIR" ]]; then
  echo "→ Поиск каталога приложения на сервере..."
  REMOTE_DIR="$(ssh "${SSH_OPTS[@]}" "$HOST" bash -s "${REMOTE_CANDIDATES[@]}" <<'REMOTE'
for d in "$@"; do
  if [ -d "$d" ]; then
    echo "$d"
    exit 0
  fi
done
echo "NOTFOUND" >&2
ls -la /var/www 2>/dev/null || true
ls -la / 2>/dev/null | head -20
exit 2
REMOTE
)" || true
fi

if [[ -z "$REMOTE_DIR" ]] || [[ "$REMOTE_DIR" == NOTFOUND* ]]; then
  echo "Задайте путь вручную: WISE_CORVUS_REMOTE_DIR=/var/www/... $0" >&2
  ssh "${SSH_OPTS[@]}" "$HOST" "ls -la /var/www; docker ps 2>/dev/null; systemctl list-units --type=service --state=running 2>/dev/null | head -20" || true
  exit 2
fi

echo "→ Источник на сервере: $HOST:$REMOTE_DIR"
mkdir -p "$DEST"
rsync -avz --progress \
  --exclude '.git' \
  -e "ssh ${SSH_OPTS[*]}" \
  "$HOST:$REMOTE_DIR/" "$DEST/"

echo "→ Готово: $DEST"
echo "Дальше: cd $DEST && git init && git add -A && git commit -m 'Import from Wise Corvus prod'"
