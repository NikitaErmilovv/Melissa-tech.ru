#!/usr/bin/env bash
# Пуш сайта Клякса в прод-репозиторий basicworker905-alt/Rita-Klyaksa (корень = файлы сайта).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/klyaksa-tuning-noyabrsk"
REMOTE="${RITA_REMOTE:-git@github.com:basicworker905-alt/Rita-Klyaksa.git}"
WORKDIR="${RITA_PUSH_DIR:-/tmp/rita-klyaksa-push}"
# Обойти глобальный insteadOf (HTTPS-токен агента) — пушим ключом basicworker905-alt.
export GIT_CONFIG_GLOBAL=/dev/null
export GIT_CONFIG_SYSTEM=/dev/null
export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -i ${HOME}/.ssh/id_ed25519_rita -o IdentitiesOnly=yes}"

if [[ ! -d "$SRC" ]]; then
  echo "Нет $SRC" >&2
  exit 1
fi

rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"
rsync -a --delete --exclude '.git' "$SRC/" "$WORKDIR/"

(
  cd "$WORKDIR"
  if [[ ! -d .git ]]; then
    git init -b main
  fi
  git add -A
  if git diff --staged --quiet; then
    echo "Нет изменений для коммита."
  else
    git commit -m "${RITA_COMMIT_MSG:-sync from Melissa-tech.ru klyaksa-tuning-noyabrsk}"
  fi
  git remote remove origin 2>/dev/null || true
  git remote add origin "$REMOTE"
  git push -u origin main
)

echo "OK → $REMOTE (main)"