#!/usr/bin/env bash
# Выкладка только /aliento на melissa-tech.ru (VPS + Caddy).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST e.g. root@185.84.163.45}"
REMOTE="${DEPLOY_PATH:?set DEPLOY_PATH e.g. /var/www/melissa-tech.ru}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/melissa_deploy}"
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)
RSYNC=(rsync -avz --delete -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new")

"${RSYNC[@]}" "$ROOT/aliento/" "$HOST:$REMOTE/aliento/"
"${RSYNC[@]}" "$ROOT/deploy-version.txt" "$HOST:$REMOTE/deploy-version.txt"
echo "OK aliento -> $HOST:$REMOTE/aliento/"
