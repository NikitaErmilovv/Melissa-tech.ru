#!/usr/bin/env bash
# Push four static sites to github.com/basicworker905-alt (run locally with your credentials).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXPORT_ROOT="${EXPORT_ROOT:-/tmp/basicworker905-alt-exports}"

# folder-on-disk : github-repo-name (create empty repo on GitHub first)
# Edit repo names to match repositories you created on GitHub.
declare -A MAP=(
  ["fantastika-home174-lazurny"]="Dmitry-Fantastika-home"
  ["klyaksa-tuning-noyabrsk"]="Klyaksa"
  ["pervushin-avtokompleks-ekaterinburg"]="Pervushin"
  ["ds7"]="DS7"
)

GITHUB_USER="${GITHUB_USER:-basicworker905-alt}"
REMOTE_PREFIX="${REMOTE_PREFIX:-git@github.com:${GITHUB_USER}}"

mkdir -p "$EXPORT_ROOT"

for dir in "${!MAP[@]}"; do
  repo="${MAP[$dir]}"
  out="$EXPORT_ROOT/$dir"
  bash "$ROOT/scripts/export-site-standalone.sh" "$dir" "$out"
  echo ""
  echo "=== $dir → ${GITHUB_USER}/${repo} ==="
  (
    cd "$out"
    if git remote get-url origin &>/dev/null; then
      git remote set-url origin "${REMOTE_PREFIX}/${repo}.git"
    else
      git remote add origin "${REMOTE_PREFIX}/${repo}.git"
    fi
    git branch -M main
    git push -u origin main
  )
done

echo "Done."
