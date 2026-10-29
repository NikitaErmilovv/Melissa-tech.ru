#!/usr/bin/env bash
# Полная выкладка melissa-tech.ru на VPS (локально, если Actions недоступен).
# export DEPLOY_HOST=root@185.84.163.45
# export DEPLOY_PATH=/var/www/melissa-tech.ru
# export DEPLOY_SSH_KEY=~/.ssh/your_vps_key
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-root@185.84.163.45}"
REMOTE="${DEPLOY_PATH:-/var/www/melissa-tech.ru}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/id_rsa}"
RSYNC=(rsync -az --delete --exclude '.git' --exclude '.github'
  -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new")
"${RSYNC[@]}" "$ROOT/" "$HOST:$REMOTE/"
echo "OK $REMOTE"
ssh -i "$KEY" -o IdentitiesOnly=yes "$HOST" "head -3 $REMOTE/pervushin-avtokompleks-ekaterinburg/deploy-version.txt"
