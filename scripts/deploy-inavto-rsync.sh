#!/usr/bin/env bash
# Выкладка InAuto на melissa-tech.ru VPS (если настроен DEPLOY_*).
# export DEPLOY_HOST=root@185.84.163.45 DEPLOY_PATH=/var/www/melissa-tech.ru
# export DEPLOY_SSH_KEY=$HOME/.ssh/melissa_deploy
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST}"
REMOTE="${DEPLOY_PATH:?set DEPLOY_PATH}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/melissa_deploy}"
RSYNC=(rsync -avz --delete -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new")

"${RSYNC[@]}" "$ROOT/deploy-version.txt" "$HOST:$REMOTE/deploy-version.txt"
"${RSYNC[@]}" "$ROOT/inavto-avtoservis-irkutsk/" "$HOST:$REMOTE/inavto-avtoservis-irkutsk/"
echo "OK https://melissa-tech.ru/inavto-avtoservis-irkutsk/"
