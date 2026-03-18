@echo off
REM Start HRMS Lite Frontend (Windows)

cd /d "%~dp0..\frontend"

if not exist "node_modules" (
    echo Installing npm dependencies...
    npm install
)

echo.
echo Starting frontend dev server on http://localhost:5173
echo Press Ctrl+C to stop.
echo.
npm run dev
