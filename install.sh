#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# SalesSaathi — One-command installer (Mac / Linux)
# Usage:  ./install.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'   # No Colour

say()  { echo -e "${BLUE}▶  $1${NC}"; }
ok()   { echo -e "${GREEN}✓  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠  $1${NC}"; }
fail() { echo -e "${RED}✗  $1${NC}"; exit 1; }

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}     SalesSaathi · Open-Source MSME CRM · Installer          ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── 1. Python ─────────────────────────────────────────────────────────────────
say "Checking Python 3.8+"
if command -v python3 &>/dev/null; then
  PY_VER=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
  PY_MAJOR=$(echo "$PY_VER" | cut -d. -f1)
  PY_MINOR=$(echo "$PY_VER" | cut -d. -f2)
  if [ "$PY_MAJOR" -ge 3 ] && [ "$PY_MINOR" -ge 8 ]; then
    ok "Python $PY_VER found"
  else
    fail "Python 3.8+ required, but found $PY_VER. Please upgrade Python."
  fi
else
  fail "Python 3 not found. Install it from https://python.org and re-run this script."
fi

# ── 2. Virtual environment ────────────────────────────────────────────────────
say "Creating Python virtual environment"
if [ ! -d "venv" ]; then
  python3 -m venv venv
  ok "Virtual environment created"
else
  ok "Virtual environment already exists — skipping"
fi

source venv/bin/activate

# ── 3. Backend dependencies ───────────────────────────────────────────────────
say "Installing backend Python packages"
pip install --quiet --upgrade pip
pip install --quiet -r backend/requirements.txt
ok "Backend packages installed"

# ── 4. Node / npm ─────────────────────────────────────────────────────────────
say "Checking Node.js (18+)"
if command -v node &>/dev/null; then
  NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_VER" -ge 18 ]; then
    ok "Node.js $(node -v) found"
  else
    warn "Node.js $(node -v) is older than 18. Trying to continue, but upgrade is recommended."
    warn "Install from: https://nodejs.org"
  fi
else
  fail "Node.js not found. Install it from https://nodejs.org and re-run this script."
fi

# ── 5. Frontend dependencies ──────────────────────────────────────────────────
say "Installing frontend packages"
cd frontend
npm install --silent
ok "Frontend packages installed"

# ── 6. Build frontend ─────────────────────────────────────────────────────────
say "Building frontend"
npm run build --silent
ok "Frontend built"
cd ..

# ── 7. Create data directory ──────────────────────────────────────────────────
mkdir -p data
ok "Data directory ready"

# ── 8. .env file ─────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  ok ".env file created (you can edit it later)"
else
  ok ".env already exists — not overwriting"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Installation complete!                                      ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  To start SalesSaathi, run:"
echo ""
echo -e "  ${BLUE}./start.sh${NC}"
echo ""
echo "  This will open the app at: http://localhost:3000"
echo "  The first-run wizard will guide you through the rest."
echo ""

# Write a start script
cat > start.sh << 'STARTSCRIPT'
#!/usr/bin/env bash
set -e
source venv/bin/activate

echo ""
echo "  Starting SalesSaathi..."
echo "  Backend → http://localhost:5000"
echo "  App     → http://localhost:3000  (opens in 3 seconds)"
echo "  Press Ctrl+C to stop."
echo ""

# Start Flask in background
cd backend
python app.py &
FLASK_PID=$!
cd ..

# Wait for Flask to come up
sleep 2

# Open browser
if command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:3000 &
elif command -v open &>/dev/null; then
  open http://localhost:3000
fi

# Start Vite dev server (serves built frontend in preview mode)
cd frontend
npx vite preview --port 3000

# On Ctrl+C, also kill Flask
trap "kill $FLASK_PID 2>/dev/null" EXIT
STARTSCRIPT

chmod +x start.sh
echo -e "  ${GREEN}✓ start.sh created${NC}"
echo ""
