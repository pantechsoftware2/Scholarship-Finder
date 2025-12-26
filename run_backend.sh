#!/bin/bash
# Scholarship Finder - Backend Startup Script for macOS/Linux

echo "Starting Scholarship Finder Backend..."
echo ""

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Check if dependencies are installed
python -c "import fastapi" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the server
echo ""
echo "Starting FastAPI server on http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
