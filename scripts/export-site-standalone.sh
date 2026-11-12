#!/usr/bin/env bash
# Export a melissa-tech.ru monorepo folder into a standalone git repo (root = site files).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_NAME="${1:?usage: export-site-standalone.sh <folder> [out-dir]}"
OUT_DIR="${2:-}"

SRC="$ROOT/$SRC_NAME"
if [[ ! -d "$SRC" ]]; then
  echo "Missing folder: $SRC" >&2
  exit 1
fi

if [[ -z "$OUT_DIR" ]]; then
  OUT_DIR="/tmp/standalone-exports/$SRC_NAME"
fi

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

rsync -a \
  --exclude '.git' \
  "$SRC/" "$OUT_DIR/"

(
  cd "$OUT_DIR"
  if [[ ! -d .git ]]; then
    git init -b main
    git add -A
    git commit -m "Import $SRC_NAME from Melissa-tech.ru monorepo"
  fi
)

echo "Ready: $OUT_DIR"
echo "Next: cd $OUT_DIR && git remote add origin <your-repo-url> && git push -u origin main"
