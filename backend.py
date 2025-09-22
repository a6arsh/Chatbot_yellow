#!/usr/bin/env python3
"""
ChatBot Backend Server
A Flask server that provides AI chat functionality using Groq API with vision support
"""

import os
import json
import logging
import base64
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
import openai

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:8001').split(',')
# Allow all origins in production for now (you can restrict this later)
if os.getenv('FLASK_DEBUG', 'True').lower() == 'false':
    CORS(app, origins="*")  # Production: allow all origins
else:
    CORS(app, origins=allowed_origins)  # Development: restrict origins

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)





# Initialize Groq client (with fallback handling)
groq_api_key = os.getenv('GROQ_API_KEY')
try:
    if groq_api_key and groq_api_key != 'your_groq_api_key_here' and groq_api_key != 'gsk_placeholder_key_for_testing':
        groq_client = Groq(api_key=groq_api_key)
        logger.info("✅ Groq client initialized successfully")
    else:
        groq_client = None
        logger.warning("⚠️  No valid Groq API key found - using fallback responses")
except Exception as e:
    logger.error(f"❌ Failed to initialize Groq client: {str(e)}")
    groq_client = None

# Initialize OpenAI client for vision fallback
openai_api_key = os.getenv('OPENAI_API_KEY')
try:
    if openai_api_key and openai_api_key != 'your_openai_api_key_here':
        openai.api_key = openai_api_key
        openai_client = openai.OpenAI(api_key=openai_api_key)
        logger.info("✅ OpenAI client initialized for vision support")
    else:
        openai_client = None
        logger.info("ℹ️  No OpenAI API key - vision will use Groq only")
except Exception as e:
    logger.error(f"❌ Failed to initialize OpenAI client: {str(e)}")
    openai_client = None

# Chat history storage (in production, use a database)
chat_sessions = {}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'ChatBot Backend'
    })
    

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint with vision support
    Expects: {
        "message": "user message",
        "image": "base64 encoded image (optional)",
        "session_id": "optional session id",
        "user_id": "optional user id"
    }
    Returns: {
        "response": "AI response",
        "session_id": "session id",
        "timestamp": "ISO timestamp"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message'].strip()
        image_data = data.get('image')  # base64 encoded image
        session_id = data.get('session_id', 'default')
        user_id = data.get('user_id', 'anonymous')
        
        if not user_message and not image_data:
            return jsonify({'error': 'Message or image is required'}), 400
        
        # Initialize session if it doesn't exist
        if session_id not in chat_sessions:
            chat_sessions[session_id] = {
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a helpful, friendly AI assistant with vision capabilities. You can see and analyze images, discuss any topic, tell jokes, share facts, help with coding, answer questions, play games, or just have a casual conversation. When users send images, describe what you see and engage with the visual content meaningfully. You are knowledgeable, engaging, and always ready to help users with their questions and tasks.'
                    }
                ],
                'user_id': user_id,
                'created_at': datetime.now().isoformat()
            }
        
        # Prepare user message content
        if image_data:
            # Handle image + text message
            user_content = []
            if user_message:
                user_content.append({
                    "type": "text",
                    "text": user_message
                })
            user_content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{image_data}"
                }
            })
            message_content = user_content
        else:
            # Text-only message
            message_content = user_message
        
        # Add user message to session
        chat_sessions[session_id]['messages'].append({
            'role': 'user',
            'content': message_content
        })
        
        # Generate AI response using Groq
        try:
            if groq_client is None:
                raise Exception("Groq API key not configured")
            
            # Try to use the vision model first
            model = "meta-llama/llama-4-maverick-17b-128e-instruct"
            
            try:
                # Attempt to use the model with image data if present
                response = groq_client.chat.completions.create(
                    model=model,
                    messages=chat_sessions[session_id]['messages'],
                    max_tokens=1000,
                    temperature=0.7,
                    top_p=1.0,
                    stream=False
                )
                
                ai_response = response.choices[0].message.content.strip()
                
            except Exception as vision_error:
                logger.error(f"Groq vision model error: {str(vision_error)}")
                
                # Try OpenAI for vision if available and there's an image
                if image_data and openai_client:
                    try:
                        logger.info("🔄 Falling back to OpenAI for vision...")
                        
                        # Prepare messages for OpenAI
                        openai_messages = [
                            {
                                "role": "system",
                                "content": "You are a helpful AI assistant with vision capabilities. Describe what you see in images and answer questions about them."
                            }
                        ]
                        
                        # Add user message
                        user_content = []
                        if user_message:
                            user_content.append({
                                "type": "text", 
                                "text": user_message
                            })
                        user_content.append({
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_data}"
                            }
                        })
                        
                        openai_messages.append({
                            "role": "user",
                            "content": user_content
                        })
                        
                        response = openai_client.chat.completions.create(
                            model="gpt-4o-mini",  # Vision-capable model
                            messages=openai_messages,
                            max_tokens=1000
                        )
                        
                        ai_response = response.choices[0].message.content.strip()
                        logger.info("✅ OpenAI vision successful")
                        
                    except Exception as openai_error:
                        logger.error(f"OpenAI vision error: {str(openai_error)}")
                        # Final fallback for images
                        ai_response = (
                            f"I can see you've shared an image with me! 📸 "
                            f"{user_message + ' ' if user_message else ''}"
                            f"I'm having trouble with my vision capabilities right now. Could you:\n\n"
                            f"• **Describe the image** - Tell me what you see and I can discuss it\n"
                            f"• **Ask specific questions** - What would you like to know about the image?\n"
                            f"• **Share any text** - If there's text in the image, I can help analyze it\n\n"
                            f"Is there anything else I can help you with? 😊"
                        )
                
                elif image_data:
                    # No OpenAI available, provide helpful fallback
                    ai_response = (
                        f"I can see you've shared an image with me! 📸 "
                        f"{user_message + ' ' if user_message else ''}"
                        f"I'm working on my vision capabilities. In the meantime, I'd be happy to help if you could:\n\n"
                        f"• **Describe the image** - Tell me what you see and I can discuss it\n"
                        f"• **Ask specific questions** - What would you like to know about the image?\n"
                        f"• **Share any text** - If there's text in the image, I can help analyze it\n\n"
                        f"Is there anything else I can help you with? 😊"
                    )
                else:
                    # For text-only, try with text-only messages
                    text_messages = []
                    for msg in chat_sessions[session_id]['messages']:
                        if msg['role'] == 'user' and isinstance(msg['content'], list):
                            # Extract text from multi-content message
                            text_parts = [part['text'] for part in msg['content'] if part.get('type') == 'text']
                            text_content = ' '.join(text_parts) if text_parts else 'User sent an image'
                            text_messages.append({'role': 'user', 'content': text_content})
                        else:
                            text_messages.append(msg)
                    
                    try:
                        response = groq_client.chat.completions.create(
                            model=model,
                            messages=text_messages,
                            max_tokens=1000,
                            temperature=0.7,
                            top_p=1.0,
                            stream=False
                        )
                        ai_response = response.choices[0].message.content.strip()
                    except Exception as text_error:
                        logger.error(f"Text model error: {str(text_error)}")
                        raise Exception("Both vision and text models failed")
            
            # Add AI response to session
            chat_sessions[session_id]['messages'].append({
                'role': 'assistant',
                'content': ai_response
            })
            
            # Keep only last 20 messages to prevent context overflow
            if len(chat_sessions[session_id]['messages']) > 21:  # 1 system + 20 conversation
                chat_sessions[session_id]['messages'] = (
                    chat_sessions[session_id]['messages'][:1] +  # Keep system message
                    chat_sessions[session_id]['messages'][-20:]  # Keep last 20
                )
            
            return jsonify({
                'response': ai_response,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat(),
                'status': 'success'
            })
            
        except Exception as groq_error:
            logger.error(f"Groq API error: {str(groq_error)}")
            
            # Fallback response if Groq fails
            if image_data:
                fallback_responses = [
                    "I'm having trouble analyzing images right now. Could you try again or describe what you'd like to know about the image?",
                    "Sorry, my vision capabilities are temporarily unavailable. Please try again in a moment.",
                    "I can't process the image right now, but feel free to describe it and I'll help as best I can!"
                ]
            else:
                fallback_responses = [
                    "I'm having trouble connecting to my AI brain right now. Could you try again?",
                    "Sorry, I'm experiencing some technical difficulties. Please try your message again.",
                    "Oops! Something went wrong on my end. Mind giving it another shot?",
                    "I'm having a momentary glitch. Could you please repeat that?"
                ]
            
            import random
            fallback_response = random.choice(fallback_responses)
            
            return jsonify({
                'response': fallback_response,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat(),
                'status': 'fallback',
                'error': 'AI service temporarily unavailable'
            })
    
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Something went wrong processing your request'
        }), 500

@app.route('/api/clear-chat', methods=['POST'])
def clear_chat():
    """Clear chat history for a session"""
    try:
        data = request.get_json() or {}
        session_id = data.get('session_id', 'default')
        
        if session_id in chat_sessions:
            del chat_sessions[session_id]
        
        return jsonify({
            'status': 'success',
            'message': 'Chat history cleared',
            'session_id': session_id
        })
    
    except Exception as e:
        logger.error(f"Clear chat error: {str(e)}")
        return jsonify({'error': 'Failed to clear chat history'}), 500

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    """Get all active sessions (for debugging)"""
    return jsonify({
        'sessions': list(chat_sessions.keys()),
        'count': len(chat_sessions)
    })

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """Handle image upload for vision analysis"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Convert image to base64
        image_data = base64.b64encode(file.read()).decode('utf-8')
        
        return jsonify({
            'image_data': image_data,
            'filename': file.filename,
            'status': 'success'
        })
    
    except Exception as e:
        logger.error(f"Image upload error: {str(e)}")
        return jsonify({'error': 'Failed to process image'}), 500

if __name__ == '__main__':
    # Check if Groq API key is set
    if not os.getenv('GROQ_API_KEY'):
        logger.warning("⚠️  Groq API key not set! Please update your .env file with a valid API key.")
        logger.warning("   The chatbot will use fallback responses until you add your API key.")
    else:
        logger.info("✅ Groq API key loaded successfully")
    
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    logger.info(f"🚀 Starting ChatBot Backend Server on port {port}")
    logger.info(f"🌐 CORS enabled for: {allowed_origins}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        threaded=True
    )
