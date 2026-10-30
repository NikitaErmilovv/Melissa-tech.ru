#!/usr/bin/env bash
# Выкладка fantastika-home174-lazurny на melissa-tech.ru (VPS).
# export DEPLOY_HOST=root@185.84.163.45
# export DEPLOY_PATH=/var/www/melissa-tech.ru
# export DEPLOY_SSH_KEY=$HOME/.ssh/your_vps_key
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@185.84.163.45}"
REMOTE="${DEPLOY_PATH:-/var/www/melissa-tech.ru}"
KEY="${DEPLOY_SSH_KEY:?set DEPLOY_SSH_KEY to private key for $HOST}"
SITE="fantastika-home174-lazurny"
RSYNC=(rsync -az
  -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new")
"${RSYNC[@]}" "$ROOT/$SITE/" "$HOST:$REMOTE/$SITE/"
echo "OK $HOST:$REMOTE/$SITE/"
ssh -i "$KEY" -o IdentitiesOnly=yes "$HOST" "grep deploy-trigger '$REMOTE/$SITE/deploy-version.txt' | tail -1"
