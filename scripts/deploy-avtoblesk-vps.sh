#!/usr/bin/env bash
# Deploy Avtoblesk site to Timeweb VPS (nginx). Requires SSH key in ~/.ssh/avtoblesk_timeweb
set -euo pipefail

HOST="${DEPLOY_HOST:-root@201.24.63.204}"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/var/www/autoblesk42.ru}"
SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/.ssh/avtoblesk_timeweb}"
SRC="$(cd "$(dirname "$0")/../avtoblesk-novokuznetsk" && pwd)"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
  exit 1
fi

SSH_OPTS=(-i "$SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)

echo "→ Checking remote directory $HOST:$REMOTE_DIR"
if ! ssh "${SSH_OPTS[@]}" "$HOST" "test -d '$REMOTE_DIR'"; then
  echo "Remote path missing. Trying to locate site root…"
  ssh "${SSH_OPTS[@]}" "$HOST" "ls -la /var/www 2>/dev/null; ls -la /var/www/*/ 2>/dev/null | head -40" || true
  echo "Set DEPLOY_REMOTE_DIR to the folder that serves autoblesk42.ru (e.g. export DEPLOY_REMOTE_DIR=/var/www/...)" >&2
  exit 1
fi

echo "→ Rsync $SRC → $HOST:$REMOTE_DIR/"
rsync -az --delete \
  --exclude '.git' \
  --exclude 'server.py' \
  --exclude '__pycache__' \
  -e "ssh ${SSH_OPTS[*]}" \
  "$SRC/" "$HOST:$REMOTE_DIR/"

echo "→ Done. Check https://autoblesk42.ru/"
