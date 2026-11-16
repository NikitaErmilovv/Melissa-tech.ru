#!/usr/bin/env bash
# detaildesk и autoblesk-sistema-ucheta — один opt-autoblesk; локальный запуск только через canonical скрипт.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/opt-autoblesk"
CANON="$(cd "$ROOT/../autoblesk-sistema-ucheta" && pwd)"

if [[ ! -f "$APP/.env" && -f "$CANON/opt-autoblesk/.env" ]]; then
  echo "Нет $APP/.env — подставляем из autoblesk-sistema-ucheta (не коммитится)."
  cp "$CANON/opt-autoblesk/.env" "$APP/.env"
fi

CANON_BOOT="$CANON/opt-autoblesk/dist/boot.js"
if [[ -f "$CANON_BOOT" ]] && ! grep -q 'startRegistration:' "$APP/dist/boot.js" 2>/dev/null; then
  echo "Синхронизация dist/boot.js из autoblesk-sistema-ucheta …"
  cp "$CANON_BOOT" "$APP/dist/boot.js"
fi

export AUTOBLESK_CANON_ROOT="$CANON"
exec "$CANON/scripts/run-local.sh"