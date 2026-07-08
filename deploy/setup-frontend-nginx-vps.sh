#!/usr/bin/env bash
set -euo pipefail

FRONTEND_DIR="/var/www/eventthon/frontend"
cd "$FRONTEND_DIR"

echo "=== Step 1: Production .env ==="
cat > .env << 'EOF'
PORT=3001
REACT_APP_API_BASE_URL=https://eventthone.com
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
EOF
chmod 600 .env
echo ".env created:"
grep -v PASSWORD .env || true

echo "=== Step 2: Install npm packages ==="
export NODE_OPTIONS="--max-old-space-size=1536"
npm install

echo "=== Step 3: Production build ==="
npm run build
test -f build/index.html
echo "Build OK: $(du -sh build | cut -f1)"

echo "=== Step 4: Nginx site config ==="
cat > /etc/nginx/sites-available/eventthon << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name eventthone.com www.eventthone.com 167.172.158.47;

    client_max_body_size 50M;

    root /var/www/eventthon/frontend/build;
    index index.html;

    location /static/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    location ~ ^/(get-user|get-user-by-email|finance|squads|users)(/|$) {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/eventthon /etc/nginx/sites-enabled/eventthon
nginx -t
systemctl reload nginx

echo "=== Step 5: HTTP health checks ==="
curl -s -o /dev/null -w "frontend / -> %{http_code}\n" http://127.0.0.1/
curl -s -o /dev/null -w "api / -> %{http_code}\n" http://127.0.0.1/api/ 2>/dev/null || curl -s -o /dev/null -w "api root -> %{http_code}\n" http://127.0.0.1:8000/

echo "=== Step 6: HTTPS via Certbot (requires DNS -> this VPS) ==="
if certbot --nginx \
  -d eventthone.com \
  -d www.eventthone.com \
  --non-interactive \
  --agree-tos \
  --register-unsafely-without-email \
  --redirect 2>/tmp/certbot-eventthon.log; then
  echo "SSL certificates installed."
  nginx -t
  systemctl reload nginx
  curl -s -o /dev/null -w "https frontend -> %{http_code}\n" https://eventthone.com/ || true
else
  echo "Certbot skipped or failed (DNS may not point to this server yet)."
  echo "See /tmp/certbot-eventthon.log"
  tail -5 /tmp/certbot-eventthon.log || true
fi

echo "=== Done ==="
systemctl is-active nginx
systemctl is-active eventthon-backend
