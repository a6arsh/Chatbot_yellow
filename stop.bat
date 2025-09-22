@echo off
REM ChatBot Windows Stop Script
echo 🛑 Stopping ChatBot servers...

REM Stop backend processes on port 5001
echo 🔍 Stopping backend server (port 5001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do (
    echo Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM Stop frontend processes on port 8001
echo 🔍 Stopping frontend server (port 8001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8001') do (
    echo Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM Also stop any old backend processes on port 5000
echo 🔍 Stopping any old backend processes (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo ✅ ChatBot servers stopped!
pause
