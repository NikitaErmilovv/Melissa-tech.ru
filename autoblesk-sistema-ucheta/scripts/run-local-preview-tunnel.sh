#!/usr/bin/env bash
# Локальный патченный boot.js + MariaDB через SSH + публичный trycloudflare на этот же инстанс.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_PORT="${PORT:-3000}"
APP_URL="http://127.0.0.1:${LOCAL_PORT}"

# Остановить старый туннель на прод, если висит
pkill -f 'cloudflared tunnel --url http://45.153.69.171' 2>/dev/null || true

SESSION="autoblesk-local-${LOCAL_PORT}"
tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION" 2>/dev/null && tmux -f /exec-daemon/tmux.portal.conf kill-session -t "=$SESSION" || true

tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION" -c "$ROOT" -- bash -lc "
  export LOCAL_PREVIEW=1
  ./scripts/run-local.sh
" || true

# Ждём порт
for i in $(seq 1 40); do
  if curl -sf -o /dev/null \"$APP_URL\" 2>/dev/null || curl -sf -o /dev/null \"$APP_URL/api/dev/preview-login\" 2>/dev/null; then
    break
  fi
  sleep 2
done

TUN_SESSION="autoblesk-crm-local-tunnel"
tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$TUN_SESSION" 2>/dev/null && tmux -f /exec-daemon/tmux.portal.conf kill-session -t "=$TUN_SESSION" || true
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$TUN_SESSION" -- bash -lc "
  /tmp/cloudflared tunnel --url \"$APP_URL\" 2>&1 | tee /tmp/autoblesk-local-tunnel.log
"

sleep 5
grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/autoblesk-local-tunnel.log | head -1 || true
echo "Локально: $APP_URL (preview: $APP_URL/api/dev/preview-login)"
echo "Лог туннеля: /tmp/autoblesk-local-tunnel.log"