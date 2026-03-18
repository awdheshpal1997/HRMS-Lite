#!/usr/bin/env bash
# Start HRMS Lite Backend (Linux / macOS)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"

cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -q -r requirements.txt

echo "Running migrations..."
python manage.py migrate --run-syncdb

echo ""
echo "Starting backend server on http://localhost:8000"
echo "Press Ctrl+C to stop."
echo ""
python manage.py runserver 8000
