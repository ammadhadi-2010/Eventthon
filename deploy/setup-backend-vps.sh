#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="/var/www/eventthon/backend"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BACKEND_DIR"

echo "=== Step 1: Ensure production .env exists ==="
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit MONGO_DETAILS and secrets before going live."
fi
chmod 600 .env

echo "=== Step 2: Create venv and install dependencies ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq python3-venv python3-pip

if [ ! -d venv ]; then
  python3 -m venv venv
fi

venv/bin/pip install --upgrade pip -q
venv/bin/pip install -r requirements.txt -q

echo "Installed packages:"
venv/bin/pip list | grep -iE "fastapi|uvicorn|gunicorn|motor|dotenv|pydantic|google-auth|multipart|stripe|httpx"

echo "=== Step 3: Verify app imports ==="
venv/bin/python -c "from main import app; print('App import OK')"

echo "=== Step 4: Install systemd service ==="
install -m 644 "$REPO_ROOT/deploy/eventthon-backend.service" /etc/systemd/system/eventthon-backend.service

systemctl daemon-reload
systemctl enable eventthon-backend
systemctl restart eventthon-backend

sleep 3
systemctl status eventthon-backend --no-pager -l || true

echo "=== Step 5: Health check ==="
curl -s http://127.0.0.1:8000/ || true
echo ""
