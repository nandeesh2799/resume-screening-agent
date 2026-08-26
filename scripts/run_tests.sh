#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

echo "=========================================="
echo "  🧪 Running ResumeRank Verification Suite "
echo "=========================================="

echo ""
echo "1. Running Backend Unit Tests (pytest)..."
pytest backend/tests/ -v

echo ""
echo "2. Validating Sample Generation Pipeline..."
python scripts/generate_sample_outputs.py

echo ""
echo "3. Testing Frontend Production Build..."
cd frontend
npm run build
cd ..

echo ""
echo "=========================================="
echo "  ✓ ALL VERIFICATION CHECKS PASSED (100%) "
echo "=========================================="
