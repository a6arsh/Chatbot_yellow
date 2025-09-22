#!/bin/bash

# ChatBot Stop Script
echo "🛑 Stopping ChatBot servers..."

# Kill processes on backend port (5001)
BACKEND_PIDS=$(lsof -ti:5001 2>/dev/null)
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "🔌 Stopping backend server (port 5001)..."
    kill -9 $BACKEND_PIDS
    echo "✅ Backend stopped"
else
    echo "ℹ️  No backend process found on port 5001"
fi

# Also check old backend port (5000) - AirPlay conflict
OLD_BACKEND_PIDS=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$OLD_BACKEND_PIDS" ]; then
    echo "🔌 Stopping old backend server (port 5000)..."
    kill -9 $OLD_BACKEND_PIDS
    echo "✅ Old backend stopped"
fi

# Kill processes on frontend port (8001)
FRONTEND_PIDS=$(lsof -ti:8001 2>/dev/null)
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "🌐 Stopping frontend server (port 8001)..."
    kill -9 $FRONTEND_PIDS
    echo "✅ Frontend stopped"
else
    echo "ℹ️  No frontend process found on port 8001"
fi

# Also check port 8000 (in case old server is running)
OLD_FRONTEND_PIDS=$(lsof -ti:8000 2>/dev/null)
if [ ! -z "$OLD_FRONTEND_PIDS" ]; then
    echo "🌐 Stopping old frontend server (port 8000)..."
    kill -9 $OLD_FRONTEND_PIDS
    echo "✅ Old frontend stopped"
fi

echo ""
echo "🎉 All ChatBot servers stopped successfully!"
