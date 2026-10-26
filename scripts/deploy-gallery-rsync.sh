#!/usr/bin/env bash
# Точечная выкладка альбомов (7 студий) по SSH. Требует DEPLOY_HOST, DEPLOY_PATH, DEPLOY_SSH_KEY.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST e.g. root@185.84.163.45}"
REMOTE="${DEPLOY_PATH:?set DEPLOY_PATH e.g. /var/www/melissa-tech.ru}"
KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/melissa_deploy}"
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)
RSYNC=(rsync -avz -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new")

STUDIOS=(
  pervushin-avtokompleks-ekaterinburg
  pervyy-rul-masterskaya-novokuznetsk
  prime38-detailing-angarsk
  proffkar-avtotekhservis-tyumen
  klyaksa-tuning-noyabrsk
  mir-tonirovki-tobolsk
  imperiya-avtokompleks-chelyabinsk
)

"${RSYNC[@]}" "$ROOT/deploy-version.txt" "$HOST:$REMOTE/deploy-version.txt"
for slug in "${STUDIOS[@]}"; do
  "${RSYNC[@]}" "$ROOT/$slug/gallery-load.js" "$HOST:$REMOTE/$slug/gallery-load.js"
  "${RSYNC[@]}" "$ROOT/$slug/data/gallery-manifest.json" "$HOST:$REMOTE/$slug/data/gallery-manifest.json"
done
echo "OK gallery files -> $HOST:$REMOTE"
