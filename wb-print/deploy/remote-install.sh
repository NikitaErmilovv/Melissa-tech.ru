#!/bin/bash
set -euo pipefail
COMPOSE_DIR=/opt/Melissa-Tech
PASS_FILE=/opt/wb-print/.panel.env
NGINX=$COMPOSE_DIR/deploy/nginx.conf

if [[ ! -f "$PASS_FILE" ]]; then
  echo "missing $PASS_FILE" >&2
  exit 1
fi
# shellcheck source=/dev/null
source "$PASS_FILE"

if ! grep -q 'wb-print:' "$COMPOSE_DIR/docker-compose.yml"; then
  cat >>"$COMPOSE_DIR/docker-compose.yml" <<EOF

  wb-print:
    build:
      context: ../wb-print
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      PORT: "8341"
      NODE_ENV: production
      PANEL_USER: \${WB_PANEL_USER}
      PANEL_PASSWORD: \${WB_PANEL_PASSWORD}
    env_file:
      - /opt/wb-print/.panel.env
    volumes:
      - wb_print_data:/app/data
    expose:
      - "8341"
EOF
  if ! grep -q 'wb_print_data:' "$COMPOSE_DIR/docker-compose.yml"; then
    sed -i '/^volumes:/a\  wb_print_data:' "$COMPOSE_DIR/docker-compose.yml"
  fi
fi

if ! grep -q 'wb-print.tw1.ru' "$NGINX"; then
  cp "$NGINX" "${NGINX}.bak-wb-print-$(date +%Y%m%d)"
  sed -i 's/server_name billing.melissa-tech.ru crm.melissa-tech.ru;/server_name billing.melissa-tech.ru crm.melissa-tech.ru wb-print.tw1.ru;/' "$NGINX"
  cat "$COMPOSE_DIR/../wb-print/deploy/melissa-tech-nginx-wb-print.conf" >>"$NGINX"
fi

cd "$COMPOSE_DIR"
docker compose build wb-print
docker compose up -d wb-print

if [[ ! -d /etc/letsencrypt/live/wb-print.tw1.ru ]]; then
  docker compose up -d nginx
  certbot certonly --webroot -w /var/www/certbot -d wb-print.tw1.ru \
    --non-interactive --agree-tos --register-unsafely-without-email || true
fi

docker compose up -d nginx
docker compose ps