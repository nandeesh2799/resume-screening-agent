#!/usr/bin/env bash
set -e

# Change to project root directory
cd "$(dirname "$0")/.."

echo "================================================="
echo "   🚀 Starting ResumeRank AI Development Stack   "
echo "================================================="

# Activate virtualenv if available
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Cleanup child processes on exit
cleanup() {
    echo ""
    echo "Shutting down development servers..."
    kill $(jobs -p) 2>/dev/null || true
    echo "✓ All servers stopped."
}
trap cleanup EXIT INT TERM

# Start FastAPI backend
echo "Starting Backend on http://localhost:8000..."
uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start Vite frontend
echo "Starting Frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✨ Full stack active!"
echo "   • Frontend UI: http://localhost:5173"
echo "   • Backend API: http://localhost:8000"
echo "   • API Docs:    http://localhost:8000/docs"
echo "Press Ctrl+C to terminate both servers."
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
