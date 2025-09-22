# ChatBot PowerShell Startup Script
# Run with: powershell -ExecutionPolicy Bypass -File start.ps1

Write-Host "🤖 Starting ChatBot Application..." -ForegroundColor Cyan

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.7+ first." -ForegroundColor Red
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if pip is installed
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✅ Found pip: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pip is not installed. Please install pip first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install Python dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
try {
    pip install -r requirements.txt
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies. Please check your internet connection." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Creating a template..." -ForegroundColor Red
    @"
GROQ_API_KEY=your_groq_api_key_here
ALLOWED_ORIGINS=http://localhost:8001
PORT=5001
FLASK_DEBUG=True
"@ | Out-File -FilePath ".env" -Encoding utf8
    
    Write-Host ""
    Write-Host "⚠️  Please update your .env file with a valid Groq API key!" -ForegroundColor Yellow
    Write-Host "   Edit .env and replace 'your_groq_api_key_here' with your actual API key." -ForegroundColor Yellow
    Write-Host "   The chatbot will work with fallback responses until you add your API key." -ForegroundColor Yellow
    Write-Host ""
}

# Check if API key is set
$envContent = Get-Content ".env" -Raw
if ($envContent -match "your_groq_api_key_here") {
    Write-Host "⚠️  Please update your .env file with a valid Groq API key!" -ForegroundColor Yellow
    Write-Host "   Edit .env and replace 'your_groq_api_key_here' with your actual API key." -ForegroundColor Yellow
    Write-Host "   The chatbot will work with fallback responses until you add your API key." -ForegroundColor Yellow
    Write-Host ""
}

# Function to kill processes on a specific port
function Kill-ProcessOnPort($port) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($process in $processes) {
            $pid = $process.OwningProcess
            Write-Host "🛑 Stopping process $pid on port $port..." -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}

# Kill any existing processes on our ports
Write-Host "🔍 Checking for existing processes..." -ForegroundColor Yellow
Kill-ProcessOnPort 5001  # Backend
Kill-ProcessOnPort 8001  # Frontend
Kill-ProcessOnPort 5000  # Old backend

# Wait for processes to fully terminate
Start-Sleep -Seconds 2

# Start backend server
Write-Host "🚀 Starting Python backend server..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "python" -ArgumentList "backend.py" -WindowStyle Normal -PassThru

# Wait for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "🌐 Starting frontend server..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath "python" -ArgumentList "-m", "http.server", "8001" -WindowStyle Normal -PassThru

# Wait for servers to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ ChatBot is now running!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:8001" -ForegroundColor Cyan
Write-Host "🔌 Backend:  http://localhost:5001" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Backend PID: $($backendProcess.Id)" -ForegroundColor Gray
Write-Host "📝 Frontend PID: $($frontendProcess.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Opening ChatBot in your default browser..." -ForegroundColor Green
Start-Process "http://localhost:8001"

Write-Host ""
Write-Host "Press Ctrl+C to stop the servers or close this window" -ForegroundColor Yellow

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
        # Check if processes are still running
        if ($backendProcess.HasExited -or $frontendProcess.HasExited) {
            Write-Host "⚠️  One of the servers has stopped unexpectedly" -ForegroundColor Red
            break
        }
    }
} finally {
    # Cleanup on exit
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Red
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Servers stopped. Goodbye!" -ForegroundColor Green
}
