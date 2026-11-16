#!/usr/bin/env bash
set -euo pipefail
ROOT="${AUTOBLESK_CANON_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
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

SSH_OPTS=(-o ExitOnForwardFailure=yes -N)
[[ -f "$SSH_KEY" ]] && SSH_OPTS=(-i "$SSH_KEY" -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new "${SSH_OPTS[@]}")

TUNNEL_LOCAL_PORT="${MARIA_TUNNEL_PORT:-13306}"

if ss -ltn "sport = :${TUNNEL_LOCAL_PORT}" 2>/dev/null | grep -q LISTEN; then
  echo "MariaDB: используем уже поднятый туннель на 127.0.0.1:${TUNNEL_LOCAL_PORT}"
else
  echo "Туннель MariaDB (локальный ${TUNNEL_LOCAL_PORT} → $SSH_HOST:3306) ..."
  ssh "${SSH_OPTS[@]}" -L "127.0.0.1:${TUNNEL_LOCAL_PORT}:127.0.0.1:3306" "$SSH_HOST" &
  TUNNEL_PID=$!
  for _ in $(seq 1 30); do
    if ss -ltn "sport = :${TUNNEL_LOCAL_PORT}" 2>/dev/null | grep -q LISTEN; then
      break
    fi
    sleep 0.2
  done
  if ! ss -ltn "sport = :${TUNNEL_LOCAL_PORT}" 2>/dev/null | grep -q LISTEN; then
    echo "Не удалось поднять SSH-туннель к MariaDB. Проверьте ключ $SSH_KEY и доступ к $SSH_HOST" >&2
    exit 1
  fi
fi

cd "$APP"
set -a
# shellcheck disable=SC1091
source .env
set +a

# Продовый URL указывает на 127.0.0.1:3306 — для локали перенаправляем на порт туннеля.
export DATABASE_URL="${DATABASE_URL/@127.0.0.1:3306/@127.0.0.1:${TUNNEL_LOCAL_PORT}}"

# Без живой БД вход / регистрация / тестовый кабинет падают с 500.
if command -v mysql >/dev/null && [[ "$DATABASE_URL" =~ mysql://([^:]+):([^@]+)@([^/]+)/(.+) ]]; then
  db_user="${BASH_REMATCH[1]}"
  db_pass="${BASH_REMATCH[2]}"
  db_host_port="${BASH_REMATCH[3]}"
  db_name="${BASH_REMATCH[4]}"
  db_host="${db_host_port%%:*}"
  db_port="${db_host_port##*:}"
  if ! mysql -h"$db_host" -P"$db_port" -u"$db_user" -p"$db_pass" "$db_name" -e 'SELECT 1' >/dev/null 2>&1; then
    echo "MariaDB недоступна ($db_host:$db_port). Скопируйте DATABASE_URL с сервера в opt-autoblesk/.env" >&2
    exit 1
  fi
  echo "MariaDB: OK ($db_host:$db_port/$db_name)"
fi

export PORT="$LOCAL_PORT"
echo "http://127.0.0.1:$LOCAL_PORT/"
echo "Preview login: http://127.0.0.1:$LOCAL_PORT/api/dev/preview-login"
exec node dist/boot.js
