@echo off
REM Start HRMS Lite Backend (Windows)

cd /d "%~dp0..\backend"

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -q -r requirements.txt

echo Running migrations...
python manage.py migrate --run-syncdb

echo.
echo Starting backend server on http://localhost:8000
echo Press Ctrl+C to stop.
echo.
python manage.py runserver 8000
