#!/usr/bin/env bash
# Скопируйте в apply-mail-env.sh, подставьте значения, запустите на сервере (или через ssh).
# Не коммитьте файл с реальным ключом.

set -euo pipefail
ENV_FILE="${ENV_FILE:-/opt/autoblesk/.env}"

DOMAIN="ЗАМЕНИТЕ-ДОМЕН"
PUBLIC_APP_URL="https://${DOMAIN}"
RESEND_API_KEY="re_ЗАМЕНИТЕ"
MAIL_FROM="Авто Блеск <noreply@${DOMAIN}>"
MAIL_REPLY_TO="support@${DOMAIN}"
MAIL_BRAND_NAME="Авто Блеск"

touch "$ENV_FILE"
for kv in \
  "PUBLIC_APP_URL=$PUBLIC_APP_URL" \
  "RESEND_API_KEY=$RESEND_API_KEY" \
  "MAIL_FROM=$MAIL_FROM" \
  "MAIL_REPLY_TO=$MAIL_REPLY_TO" \
  "MAIL_BRAND_NAME=$MAIL_BRAND_NAME"; do
  key="${kv%%=*}"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${kv}|" "$ENV_FILE"
  else
    echo "$kv" >>"$ENV_FILE"
  fi
done

echo "OK. Проверка:"
grep -E '^(PUBLIC_APP_URL|MAIL_FROM)=' "$ENV_FILE"
grep '^RESEND_API_KEY=' "$ENV_FILE" | sed 's/=.*$/=***скрыт***/'
systemctl restart autoblesk
curl -s "http://127.0.0.1:3000/api/build-info" | head -c 400
echo