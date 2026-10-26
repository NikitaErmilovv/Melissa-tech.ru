#!/usr/bin/env bash
# Выкладка только Okleyka07 (актуальный прототип) на melissa-tech.ru VPS.
# export DEPLOY_HOST=root@185.84.163.45 DEPLOY_PATH=/var/www/melissa-tech.ru
# export DEPLOY_SSH_KEY=$HOME/.ssh/melissa_deploy
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST}"
REMOTE="${DEPLOY_PATH:?set DEPLOY_PATH}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/melissa_deploy}"
SLUG=okleyka07-avtotekhtsentr-bittsa

rsync -avz --delete \
  -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
  "$ROOT/$SLUG/" "$HOST:$REMOTE/$SLUG/"

echo "OK $SLUG -> $HOST:$REMOTE/$SLUG/"
echo "https://melissa-tech.ru/$SLUG/"
