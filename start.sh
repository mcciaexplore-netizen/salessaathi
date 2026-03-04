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
