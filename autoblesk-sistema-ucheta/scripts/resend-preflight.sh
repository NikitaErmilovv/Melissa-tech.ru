#!/usr/bin/env bash
# Быстрая проверка готовности Resend (можно с локальной машины или с сервера)
set -euo pipefail
BASE="${1:-http://45.153.69.171}"

echo "== build-info =="
curl -sS "${BASE%/}/api/build-info" | python3 -m json.tool 2>/dev/null || curl -sS "${BASE%/}/api/build-info"
echo
echo "Ожидание после настройки:"
echo "  mail.resendConfigured: true"
echo "  mail.publicAppUrl: https://ваш-домен"
echo "  mail.from: noreply@ваш-домен"