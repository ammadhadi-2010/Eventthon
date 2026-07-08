#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="/var/www/eventthon/backend"
cd "$BACKEND_DIR"

echo "=== Step 1: Create production .env ==="
cat > .env << 'EOF'
# MongoDB Atlas
MONGO_DETAILS=mongodb+srv://EventThon0704668:Eventhadi123@ammad.6mbkige.mongodb.net/EventThon_Network?retryWrites=true&w=majority
DB_NAME=EventThon_Network

# Google OAuth (update with your production client ID)
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# Optional: Post Wizard AI Enhance
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

ADMIN_OTP=889900
API_HOST=0.0.0.0
API_PORT=8000

# Production + local dev origins
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://eventthone.com,https://eventthone.com,http://www.eventthone.com,https://www.eventthone.com,http://167.172.158.47,https://167.172.158.47

# Gmail SMTP (Forgot Password OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ammadhadi2010@gmail.com
SMTP_PASSWORD=bcfgjvmxmlrdxxje
EOF
chmod 600 .env
echo ".env created"

echo "=== Step 2: Create venv and install dependencies ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq python3-venv python3-pip

if [ ! -d venv ]; then
  python3 -m venv venv
fi

venv/bin/pip install --upgrade pip -q
venv/bin/pip install -q \
  "fastapi>=0.100.0" \
  "uvicorn[standard]>=0.23.0" \
  "motor>=3.3.0" \
  "python-dotenv>=1.0.0" \
  "pydantic[email]>=2.0.0" \
  "google-auth>=2.0.0" \
  "googlesearch-python>=1.3.0" \
  "requests>=2.20.0" \
  "beautifulsoup4>=4.9.0" \
  "python-multipart>=0.0.6"

echo "Installed packages:"
venv/bin/pip list | grep -iE "fastapi|uvicorn|motor|dotenv|pydantic|google-auth|multipart"

echo "=== Step 3: Verify app imports ==="
venv/bin/python -c "from main import app; print('App import OK')"

echo "=== Step 4: Create systemd service ==="
cat > /etc/systemd/system/eventthon-backend.service << 'EOF'
[Unit]
Description=EventThon FastAPI Backend (Uvicorn)
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/var/www/eventthon/backend
Environment=PATH=/var/www/eventthon/backend/venv/bin
ExecStart=/var/www/eventthon/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable eventthon-backend
systemctl restart eventthon-backend

sleep 3
systemctl status eventthon-backend --no-pager -l

echo "=== Step 5: Health check ==="
curl -s http://127.0.0.1:8000/
echo ""
