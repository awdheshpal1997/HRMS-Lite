#!/usr/bin/env bash
# Start HRMS Lite Frontend (Linux / macOS)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

echo ""
echo "Starting frontend dev server on http://localhost:5173"
echo "Press Ctrl+C to stop."
echo ""
npm run dev
