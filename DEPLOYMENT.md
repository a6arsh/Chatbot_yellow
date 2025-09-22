# 🚀 Deployment Guide

## Deploy to Render (Free)

### Prerequisites
- GitHub repository with your code
- Groq API key (free from groq.com)
- Optional: OpenAI API key for vision features

### Steps

1. **Push code to GitHub** (if not done already)
2. **Go to [render.com](https://render.com)** and sign up/login
3. **Connect your GitHub account**
4. **Create New → Blueprint**
5. **Connect your repository**: `https://github.com/a6arsh/Chatbot_yellow`
6. **Render will auto-detect the render.yaml file**

### Environment Variables to Set in Render:
- `GROQ_API_KEY`: Your Groq API key
- `OPENAI_API_KEY`: Your OpenAI API key (optional)

### After Deployment:
- Backend will be available at: `https://chatbot-backend.onrender.com`
- Frontend will be available at: `https://chatbot-frontend.onrender.com`
- The app will automatically connect frontend to backend

### Free Tier Limitations:
- Apps sleep after 15 minutes of inactivity
- 750 hours/month of runtime
- Perfect for testing and demos!

## Local Development
Use the existing scripts:
- `./start.sh` (macOS/Linux)
- `start.bat` (Windows)
