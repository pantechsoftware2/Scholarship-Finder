@echo off
REM Scholarship Finder - Frontend Startup Script for Windows

echo Starting Scholarship Finder Frontend...
echo.

cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Start the development server
echo.
echo Starting React development server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

call npm start

pause
