#!/bin/bash
# Scholarship Finder - Frontend Startup Script for macOS/Linux

echo "Starting Scholarship Finder Frontend..."
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
echo ""
echo "Starting React development server on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npm start
