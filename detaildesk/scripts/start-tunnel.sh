#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-3000}"
LOG="${AUTOBLESK_CF_LOG:-/tmp/autoblesk-crm-tunnel.log}"
rm -f "$LOG"
exec cloudflared tunnel --url "http://127.0.0.1:${PORT}" 2>&1 | tee "$LOG"
