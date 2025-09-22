@echo off
REM ChatBot Windows Startup Script
echo 🤖 Starting ChatBot Application...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.7+ first.
    echo    Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not installed. Please install pip first.
    pause
    exit /b 1
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies. Please check your internet connection.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Creating a template...
    echo GROQ_API_KEY=your_groq_api_key_here > .env
    echo ALLOWED_ORIGINS=http://localhost:8001 >> .env
    echo PORT=5001 >> .env
    echo FLASK_DEBUG=True >> .env
    echo.
    echo ⚠️  Please update your .env file with a valid Groq API key!
    echo    Edit .env and replace 'your_groq_api_key_here' with your actual API key.
    echo    The chatbot will work with fallback responses until you add your API key.
    echo.
)

REM Check if API key is set
findstr "your_groq_api_key_here" .env >nul
if not errorlevel 1 (
    echo ⚠️  Please update your .env file with a valid Groq API key!
    echo    Edit .env and replace 'your_groq_api_key_here' with your actual API key.
    echo    The chatbot will work with fallback responses until you add your API key.
    echo.
)

REM Kill any existing processes on our ports
echo 🔍 Checking for existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do (
    echo 🛑 Stopping existing backend process...
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8001') do (
    echo 🛑 Stopping existing frontend process...
    taskkill /f /pid %%a >nul 2>&1
)

REM Wait a moment for processes to fully terminate
timeout /t 2 /nobreak >nul

REM Start backend server
echo 🚀 Starting Python backend server...
start "ChatBot Backend" cmd /c "python backend.py"

REM Wait for backend to start
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend server
echo 🌐 Starting frontend server...
start "ChatBot Frontend" cmd /c "python -m http.server 8001"

REM Wait a moment for servers to start
timeout /t 3 /nobreak >nul

echo.
echo ✅ ChatBot is now running!
echo 🌐 Frontend: http://localhost:8001
echo 🔌 Backend:  http://localhost:5001
echo.
echo 📝 To stop the servers, close the terminal windows or press Ctrl+C in each
echo.
echo 🎉 Opening ChatBot in your default browser...
start http://localhost:8001

pause
