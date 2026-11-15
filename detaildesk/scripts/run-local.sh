#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/opt-autoblesk"
SSH_HOST="${AUTOBLESK_SSH:-root@45.153.69.171}"
SSH_KEY="${AUTOBLESK_SSH_KEY:-$HOME/.ssh/wise_corvus}"
LOCAL_PORT="${PORT:-3000}"

if [[ ! -f "$APP/.env" ]]; then
  echo "Нет $APP/.env — скопируйте с сервера /opt/autoblesk/.env" >&2
  exit 1
fi

if ! command -v node >/dev/null; then
  echo "Нужен Node.js 22+" >&2
  exit 1
fi

cleanup() {
  [[ -n "${TUNNEL_PID:-}" ]] && kill "$TUNNEL_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

SSH_OPTS=(-o ExitOnForwardFailure=yes -N -L "127.0.0.1:13306:127.0.0.1:3306")
[[ -f "$SSH_KEY" ]] && SSH_OPTS=(-i "$SSH_KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new "${SSH_OPTS[@]}")

echo "Туннель MariaDB (локальный 13306 → $SSH_HOST:3306) ..."
ssh "${SSH_OPTS[@]}" "$SSH_HOST" &
TUNNEL_PID=$!
sleep 2

cd "$APP"
set -a
# shellcheck disable=SC1091
source .env
set +a

# Продовый URL указывает на 127.0.0.1:3306 — для локали перенаправляем на порт туннеля.
export DATABASE_URL="${DATABASE_URL/@127.0.0.1:3306/@127.0.0.1:13306}"
export PORT="$LOCAL_PORT"
echo "http://127.0.0.1:$LOCAL_PORT/"
echo "Preview login: http://127.0.0.1:$LOCAL_PORT/api/dev/preview-login"
exec node dist/boot.js
