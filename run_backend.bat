@echo off
REM Scholarship Finder - Backend Startup Script for Windows

echo Starting Scholarship Finder Backend...
echo.

cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if dependencies are installed
pip show fastapi > nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Start the server
echo.
echo Starting FastAPI server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

pause
