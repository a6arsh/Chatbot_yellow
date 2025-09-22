# ChatBot Application

A modern, full-stack AI chatbot application with vision capabilities. Features a beautiful frontend interface with user authentication and a Python Flask backend powered by Groq API.

## 🌟 Features

- **User Authentication**: Secure login and registration system
- **AI Chat Interface**: Interactive chat with AI assistant
- **Vision Support**: Upload and analyze images with AI
- **Real-time Chat**: Instant responses with typing indicators
- **Session Management**: Persistent chat history
- **Responsive Design**: Works on desktop and mobile
- **Cross-Platform**: Runs on Windows, macOS, and Linux

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **Backend**: Python 3.7+, Flask, Flask-CORS
- **AI**: Groq API with Llama models
- **Storage**: LocalStorage for frontend data
- **Styling**: Custom CSS with modern design principles

## 📋 Prerequisites

- **Python 3.7 or higher**
- **pip** (Python package manager)
- **Internet connection** (for installing dependencies and AI API calls)
- **Groq API Key** (free at [groq.com](https://groq.com))

## 🚀 Installation & Setup

### Windows Users

#### Option 1: Batch File (Recommended for beginners)
1. Clone or download this repository
2. Open Command Prompt or PowerShell in the project directory
3. Run the startup script:
   ```cmd
   start.bat
   ```

#### Option 2: PowerShell Script (Advanced users)
1. Open PowerShell as Administrator
2. Navigate to the project directory
3. Run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File start.ps1
   ```

### macOS/Linux Users
1. Clone or download this repository
2. Open Terminal in the project directory
3. Make the script executable:
   ```bash
   chmod +x start.sh
   ```
4. Run the startup script:
   ```bash
   ./start.sh
   ```

### Manual Setup (All Platforms)
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file in the project root:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ALLOWED_ORIGINS=http://localhost:8001
   PORT=5001
   FLASK_DEBUG=True
   ```

3. Get your free Groq API key:
   - Visit [groq.com](https://groq.com)
   - Sign up for a free account
   - Generate an API key
   - Replace `your_groq_api_key_here` in the `.env` file

4. Start the backend server:
   ```bash
   python backend.py
   ```

5. In a new terminal, start the frontend server:
   ```bash
   python -m http.server 8001
   ```

6. Open your browser and go to: `http://localhost:8001`

## 🎯 How to Use

1. **Register**: Create a new account on the registration page
2. **Login**: Sign in with your credentials
3. **Chat**: Start chatting with the AI assistant
4. **Upload Images**: Click the image icon to upload and analyze images
5. **Clear Chat**: Use the clear button to reset conversation history

## 🔧 Configuration

### Environment Variables (.env file)
- `GROQ_API_KEY`: Your Groq API key for AI functionality
- `ALLOWED_ORIGINS`: Allowed CORS origins (default: http://localhost:8001)
- `PORT`: Backend server port (default: 5001)
- `FLASK_DEBUG`: Enable debug mode (default: True)

## 🛑 Stopping the Application

### Windows
- **Batch file users**: Close the command prompt windows or press Ctrl+C
- **PowerShell users**: Press Ctrl+C in the PowerShell window
- **Manual**: Run `stop.bat` or use Task Manager to end Python processes

### macOS/Linux
- Press `Ctrl+C` in the terminal running the startup script
- Or run: `./stop.sh`

## 🔍 Troubleshooting

### Common Issues

1. **"Python is not recognized"**
   - Install Python from [python.org](https://python.org)
   - Make sure to check "Add Python to PATH" during installation

2. **Port already in use**
   - Run the stop script to kill existing processes
   - Or manually kill processes using ports 5001 and 8001

3. **API key not working**
   - Verify your Groq API key is correct
   - Check that the `.env` file is in the project root
   - Ensure no extra spaces in the API key

4. **Dependencies won't install**
   - Update pip: `pip install --upgrade pip`
   - Use virtual environment: `python -m venv venv && venv\Scripts\activate`

### Windows-Specific Issues

1. **PowerShell execution policy error**
   - Run PowerShell as Administrator
   - Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

2. **Batch file won't run**
   - Right-click and "Run as Administrator"
   - Check that Python is in your system PATH

## 🌐 Access URLs

- **Frontend**: http://localhost:8001
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

## 📁 Project Structure

```
ChatBot/
├── app.html              # Main application page
├── app.js                # Frontend application logic
├── backend.py            # Flask backend server
├── chatbot.html          # Chat interface
├── chatbot.js            # Chat functionality
├── login.html            # Login page
├── register.html         # Registration page
├── *.css                 # Styling files
├── requirements.txt      # Python dependencies
├── start.sh             # Unix startup script
├── start.bat            # Windows batch startup script
├── start.ps1            # Windows PowerShell startup script
├── stop.sh              # Unix stop script
├── stop.bat             # Windows stop script
└── README.md            # This file
```
License
This project is licensed under the MIT License - see the LICENSE file for details.
