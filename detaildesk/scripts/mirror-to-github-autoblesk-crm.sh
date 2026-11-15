#!/usr/bin/env bash
# Залить этот снимок в приватный NikitaErmilovv/autoblesk-crm (запускать у себя, где есть доступ к репо).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

rsync -a --exclude .env --exclude .git "$ROOT/" "$WORKDIR/"
cd "$WORKDIR"
git init -b main
git add -A
git commit -m "Import production snapshot from Wise Corvus ($(date -Iseconds))"

REMOTE="${AUTOBLESK_CRM_REMOTE:-git@github.com:NikitaErmilovv/autoblesk-crm.git}"
git remote add origin "$REMOTE"
git push -u origin main --force

echo "→ Запушено в $REMOTE"
