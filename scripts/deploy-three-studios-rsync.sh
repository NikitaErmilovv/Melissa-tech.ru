#!/usr/bin/env bash
# Выкладка Лобавто, Конкретика, Прямые руки 55 (+ альбом Работы) на melissa-tech.ru VPS.
# export DEPLOY_HOST=root@185.84.163.45 DEPLOY_PATH=/var/www/melissa-tech.ru
# export DEPLOY_SSH_KEY=$HOME/.ssh/melissa_deploy
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST}"
REMOTE="${DEPLOY_PATH:?set DEPLOY_PATH}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/melissa_deploy}"
RSYNC=(rsync -avz --delete -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new")

SLUGS=(
  lobavto-nizhniy-novgorod
  konkretika-detailing-omsk
  pryamye-ruki-55-omsk
)

"${RSYNC[@]}" "$ROOT/deploy-version.txt" "$HOST:$REMOTE/deploy-version.txt"
for slug in "${SLUGS[@]}"; do
  "${RSYNC[@]}" "$ROOT/$slug/" "$HOST:$REMOTE/$slug/"
  echo "OK $slug -> $HOST:$REMOTE/$slug/"
done

echo "Prod:"
echo "  https://melissa-tech.ru/lobavto-nizhniy-novgorod/"
echo "  https://melissa-tech.ru/konkretika-detailing-omsk/"
echo "  https://melissa-tech.ru/pryamye-ruki-55-omsk/"
