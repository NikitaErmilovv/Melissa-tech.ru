#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://melissa-tech.ru/aliento}"
export NEXT_PUBLIC_BASE_PATH="/aliento"
export ALIENTO_MELISSA_EXPORT=1

# Stash outside src/app so Next does not compile server-action routes.
HIDE_DIR="$ROOT/.melissa-export-stash"
mkdir -p "$HIDE_DIR"
HIDE_PATHS=(
  api
  admin
  cabinet
  login
  register
  forgot-password
  reset-password
  verify-email
  halls
)
for rel in "${HIDE_PATHS[@]}"; do
  if [[ -d "src/app/$rel" ]]; then
    mv "src/app/$rel" "$HIDE_DIR/$rel"
  fi
done
if [[ -d "src/actions" ]]; then
  mv "src/actions" "$HIDE_DIR/actions"
fi
mkdir -p "$HIDE_DIR/components"
while IFS= read -r f; do
  base="$(basename "$f")"
  mv "$f" "$HIDE_DIR/components/$base"
done < <(grep -rl '@/actions' src/components 2>/dev/null || true)
if [[ -f "src/components/BookButton.static.tsx" ]]; then
  cp "src/components/BookButton.static.tsx" "src/components/BookButton.tsx"
fi
for comp in AdminSidebar.tsx AppSidebar.tsx; do
  if [[ -f "src/components/$comp" ]]; then
    mv "src/components/$comp" "$HIDE_DIR/components/$comp"
  fi
done
# Legacy stash from older script versions
if [[ -d "src/app/_melissa_export_hidden" ]]; then
  rm -rf "src/app/_melissa_export_hidden"
fi
cleanup() {
  for rel in "${HIDE_PATHS[@]}"; do
    if [[ -d "$HIDE_DIR/$rel" ]]; then
      mv "$HIDE_DIR/$rel" "src/app/$rel"
    fi
  done
  if [[ -d "$HIDE_DIR/actions" ]]; then
    mv "$HIDE_DIR/actions" "src/actions"
  fi
  rm -f "src/components/BookButton.tsx"
  if [[ -d "$HIDE_DIR/components" ]]; then
    for f in "$HIDE_DIR/components"/*; do
      [[ -e "$f" ]] || continue
      mv "$f" "src/components/$(basename "$f")"
    done
  fi
}
trap cleanup EXIT

rm -rf out .next
npx next build --webpack

echo "Static export ready in $ROOT/out"

MELISSA_REPO="${MELISSA_REPO:-$ROOT/../Melissa-tech.ru/aliento}"
if [[ -d "$MELISSA_REPO" ]]; then
  python3 - "$ROOT/out" "$MELISSA_REPO" << 'PY'
import shutil, sys
from pathlib import Path

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
keep = {"deploy-version.txt", "README.md"}
for item in list(dst.iterdir()):
    if item.name in keep:
        continue
    if item.is_dir():
        shutil.rmtree(item)
    else:
        item.unlink()
for item in src.iterdir():
    target = dst / item.name
    if item.is_dir():
        shutil.copytree(item, target)
    else:
        shutil.copy2(item, target)
print(f"Synced static export -> {dst}")
PY
  TS="$(TZ=Asia/Novosibirsk date +%Y%m%d-%H%M%S)"
  printf 'site=aliento\npath=/aliento/\ndeploy=git-push-master\ndeploy-trigger=aliento-export-%s\n' "$TS" > "$MELISSA_REPO/deploy-version.txt"
fi
