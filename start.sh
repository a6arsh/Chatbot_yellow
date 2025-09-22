#!/bin/bash

# ChatBot Startup Script
echo "🤖 Starting ChatBot Application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Check if .env file exists and has API key
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one with your OpenAI API key."
    exit 1
fi

# Check if API key is set
if grep -q "your_openai_api_key_here" .env; then
    echo "⚠️  Please update your .env file with a valid OpenAI API key!"
    echo "   Edit .env and replace 'your_openai_api_key_here' with your actual API key."
    echo "   The chatbot will work with fallback responses until you add your API key."
fi

# Start backend server in background
echo "🚀 Starting Python backend server..."
python3 backend.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check and kill existing processes on ports
echo "🔍 Checking for existing processes..."
BACKEND_PIDS=$(lsof -ti:5001 2>/dev/null)
FRONTEND_PIDS=$(lsof -ti:8001 2>/dev/null)
OLD_BACKEND_PIDS=$(lsof -ti:5000 2>/dev/null)

if [ ! -z "$BACKEND_PIDS" ]; then
    echo "🛑 Stopping existing backend processes..."
    kill -9 $BACKEND_PIDS 2>/dev/null
fi

if [ ! -z "$OLD_BACKEND_PIDS" ]; then
    echo "🛑 Stopping old backend processes (port 5000)..."
    kill -9 $OLD_BACKEND_PIDS 2>/dev/null
fi

if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "🛑 Stopping existing frontend processes..."
    kill -9 $FRONTEND_PIDS 2>/dev/null
fi

sleep 2

# Start frontend server on port 8001
echo "🌐 Starting frontend server..."
python3 -m http.server 8001 &
FRONTEND_PID=$!

echo ""
echo "✅ ChatBot is now running!"
echo "🌐 Frontend: http://localhost:8001"
echo "🔌 Backend:  http://localhost:5001"
echo ""
echo "📝 To stop the servers, press Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped. Goodbye!"
    exit 0
}

# Set trap to cleanup on interrupt
trap cleanup INT

# Wait for user to interrupt
wait
