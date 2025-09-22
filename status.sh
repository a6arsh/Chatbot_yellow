#!/bin/bash

# ChatBot Status Check Script
echo "🤖 ChatBot Status Check"
echo "======================"

# Check backend (port 5001)
BACKEND_PID=$(lsof -ti:5001 2>/dev/null)
if [ ! -z "$BACKEND_PID" ]; then
    echo "🔌 Backend:  ✅ Running (PID: $BACKEND_PID) - http://localhost:5001"
    
    # Test backend health
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        echo "   💚 Health check: PASSED"
    else
        echo "   ❌ Health check: FAILED"
    fi
else
    echo "🔌 Backend:  ❌ Not running"
fi

# Check old backend (port 5000) - AirPlay conflict
OLD_BACKEND_PID=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$OLD_BACKEND_PID" ]; then
    echo "🔌 Old Backend: ⚠️  Still running (PID: $OLD_BACKEND_PID) - http://localhost:5000"
    echo "   💡 This might be macOS AirPlay. Consider disabling it in System Preferences."
fi

# Check frontend (port 8001)
FRONTEND_PID=$(lsof -ti:8001 2>/dev/null)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "🌐 Frontend: ✅ Running (PID: $FRONTEND_PID) - http://localhost:8001"
else
    echo "🌐 Frontend: ❌ Not running"
fi

# Check old frontend (port 8000)
OLD_FRONTEND_PID=$(lsof -ti:8000 2>/dev/null)
if [ ! -z "$OLD_FRONTEND_PID" ]; then
    echo "🌐 Old Frontend: ⚠️  Still running (PID: $OLD_FRONTEND_PID) - http://localhost:8000"
    echo "   💡 Consider stopping with: kill -9 $OLD_FRONTEND_PID"
fi

echo ""
if [ ! -z "$BACKEND_PID" ] && [ ! -z "$FRONTEND_PID" ]; then
    echo "🎉 ChatBot is fully operational!"
    echo "   👉 Open: http://localhost:8001"
elif [ ! -z "$BACKEND_PID" ] || [ ! -z "$FRONTEND_PID" ]; then
    echo "⚠️  ChatBot is partially running"
    echo "   💡 Run: ./start.sh to start both servers"
else
    echo "❌ ChatBot is not running"
    echo "   💡 Run: ./start.sh to start the application"
fi
