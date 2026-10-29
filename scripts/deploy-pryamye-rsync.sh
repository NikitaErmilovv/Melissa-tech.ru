#!/usr/bin/env bash
# Быстрая выкладка только pryamye-ruki-55-omsk на VPS (без --delete всего монорепо).
# export DEPLOY_HOST=root@185.84.163.45
# export DEPLOY_PATH=/var/www/melissa-tech.ru
# export DEPLOY_SSH_KEY=$HOME/.ssh/your_vps_key
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@185.84.163.45}"
REMOTE="${DEPLOY_PATH:-/var/www/melissa-tech.ru}"
KEY="${DEPLOY_SSH_KEY:?set DEPLOY_SSH_KEY to private key for $HOST}"
SITE="pryamye-ruki-55-omsk"
RSYNC=(rsync -az
  -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new")
"${RSYNC[@]}" "$ROOT/$SITE/" "$HOST:$REMOTE/$SITE/"
echo "OK $HOST:$REMOTE/$SITE/"
ssh -i "$KEY" -o IdentitiesOnly=yes "$HOST" "grep deploy-trigger '$REMOTE/$SITE/deploy-version.txt' | tail -1"
