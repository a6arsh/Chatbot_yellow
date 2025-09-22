// Single Page Application for ChatBot
// Handles routing, authentication, and backend connectivity

class ChatBotApp {
    constructor() {
        this.currentPage = 'login';
        this.currentUser = null;
        this.sessionId = this.generateSessionId();
        this.chatHistory = [];
        this.isWaitingForResponse = false;
        this.selectedImage = null;
        
        // Backend configuration
        // Auto-detect if we're in production or development
        this.BACKEND_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:5001'
            : 'https://chatbot-backend.onrender.com';
        
        // Initialize the app
        this.init();
    }

    // Initialize the application
    init() {
        this.loadStoredData();
        this.setupEventListeners();
        this.setupImageUpload();
        this.checkAuthStatus();
        this.showPage(this.currentPage);
    }

    // Generate unique session ID
    generateSessionId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Load data from localStorage
    loadStoredData() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
        this.sessionId = localStorage.getItem('chatSessionId') || this.sessionId;
        localStorage.setItem('chatSessionId', this.sessionId);
    }

    // Check authentication status
    checkAuthStatus() {
        if (this.currentUser) {
            this.currentPage = 'chat';
        } else {
            this.currentPage = 'login';
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Navigation
        document.getElementById('showRegisterBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('register');
        });

        document.getElementById('showLoginBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('login');
        });

        // Authentication forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        // Chat functionality
        document.getElementById('chatForm').addEventListener('submit', (e) => this.handleChatSubmit(e));
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearChat());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfile());

        // Quick replies
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-quick-reply')) {
                this.sendMessage(e.target.textContent);
            }
        });
    }

    // Setup image upload functionality
    setupImageUpload() {
        const imageInput = document.getElementById('imageInput');
        const attachButton = document.getElementById('attachButton');

        attachButton.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    this.showError('Image file is too large. Please select an image under 10MB.');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.selectedImage = e.target.result.split(',')[1]; // Remove data URL prefix
                    attachButton.style.color = 'var(--accent-yellow)';
                    attachButton.innerHTML = '<i class="fas fa-image"></i><span style="font-size: 0.7em;">✓</span>';
                    document.getElementById('userInput').placeholder = 'Ask about the image or add your message...';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Show specific page
    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        document.getElementById(pageName + 'Page').classList.add('active');
        this.currentPage = pageName;

        // Load chat history if showing chat page
        if (pageName === 'chat') {
            this.loadChatMessages();
        }
    }

    // Show loading spinner
    showLoading() {
        document.getElementById('loadingSpinner').style.display = 'block';
    }

    // Hide loading spinner
    hideLoading() {
        document.getElementById('loadingSpinner').style.display = 'none';
    }

    // Show error message
    showError(message, elementId = null) {
        if (elementId) {
            const errorElement = document.getElementById(elementId);
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }

    // Show success message
    showSuccess(message, elementId) {
        const successElement = document.getElementById(elementId);
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Get stored users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = {
                fullName: user.fullName,
                email: user.email
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showPage('chat');
        } else {
            this.showError('Invalid email or password', 'loginError');
        }
    }

    // Handle registration
    async handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // Validation
        if (password !== confirmPassword) {
            this.showError('Passwords do not match', 'registerError');
            return;
        }

        if (password.length < 8) {
            this.showError('Password must be at least 8 characters long', 'registerError');
            return;
        }

        // Check if user exists
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(user => user.email === email)) {
            this.showError('This email is already registered', 'registerError');
            return;
        }

        // Add new user
        const newUser = {
            fullName: name,
            email: email,
            password: password
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        this.showSuccess('Registration successful! You can now login.', 'registerSuccess');
        
        // Clear form
        document.getElementById('registerForm').reset();
        
        // Switch to login after 2 seconds
        setTimeout(() => {
            this.showPage('login');
        }, 2000);
    }

    // Handle chat form submission
    handleChatSubmit(e) {
        e.preventDefault();
        
        const message = document.getElementById('userInput').value.trim();
        if (message || this.selectedImage) {
            this.sendMessage(message, this.selectedImage);
            
            // Reset form
            document.getElementById('userInput').value = '';
            this.resetImageUpload();
        }
    }

    // Reset image upload state
    resetImageUpload() {
        this.selectedImage = null;
        const attachButton = document.getElementById('attachButton');
        attachButton.style.color = '';
        attachButton.innerHTML = '<i class="fas fa-image"></i>';
        document.getElementById('userInput').placeholder = 'Type your message...';
        document.getElementById('imageInput').value = '';
    }

    // Send message to backend
    async sendMessage(message, imageData = null) {
        if (this.isWaitingForResponse) return;

        this.isWaitingForResponse = true;
        
        // Add user message to chat
        this.addUserMessage(message, imageData);
        this.showTypingIndicator();

        try {
            const requestBody = {
                message: message || '',
                session_id: this.sessionId,
                user_id: this.currentUser?.email || 'anonymous'
            };

            if (imageData) {
                requestBody.image = imageData;
            }

            const response = await fetch(`${this.BACKEND_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            this.hideTypingIndicator();
            this.addBotMessage(data.response);

        } catch (error) {
            console.error('Error calling backend API:', error);
            this.hideTypingIndicator();
            
            // Fallback response
            const fallbackResponse = this.generateFallbackResponse(message, imageData);
            this.addBotMessage(fallbackResponse);
        } finally {
            this.isWaitingForResponse = false;
        }
    }

    // Generate fallback response when backend is unavailable
    generateFallbackResponse(message, imageData) {
        if (imageData) {
            return "I can see you've shared an image! 📸 Unfortunately, I don't currently have vision capabilities, but I'd love to help if you describe what you're seeing or have questions about!";
        }

        const responses = [
            "I'm having some technical difficulties right now, but I'm still here to chat! What's on your mind?",
            "My AI brain is taking a little break, but I can still have a conversation with you!",
            "I'm running on backup power right now, but I'm ready to help however I can!",
            "Technical hiccup on my end, but let's keep chatting! What would you like to talk about?"
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Add user message to chat interface
    addUserMessage(message, imageData) {
        const messageObj = { type: 'user', text: message, image: imageData, timestamp: new Date().toISOString() };
        this.chatHistory.push(messageObj);
        this.saveChatHistory();

        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message slide-up';

        let imagePreview = '';
        if (imageData) {
            imagePreview = `<img src="data:image/jpeg;base64,${imageData}" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-bottom: 0.5rem;" alt="Uploaded image">`;
        }

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">
                    ${imagePreview}
                    ${message ? `<p>${message}</p>` : '<p><em>Sent an image</em></p>'}
                </div>
                <i class="fas fa-user user-icon"></i>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    // Parse and format message content with markdown support
    parseMessage(message) {
        if (!message) return '';
        
        let parsed = message;
        
        // Step 1: Handle code blocks first (to protect them from other parsing)
        const codeBlocks = [];
        parsed = parsed.replace(/```(\w+)?\s*\n?([\s\S]*?)```/g, (match, language, code) => {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            const lang = language ? ` class="language-${language}"` : '';
            codeBlocks.push(`<div class="code-block"><pre><code${lang}>${this.escapeHtml(code.trim())}</code></pre></div>`);
            return placeholder;
        });
        
        // Step 2: Handle inline code (to protect from other parsing)
        const inlineCodes = [];
        parsed = parsed.replace(/`([^`\n]+)`/g, (match, code) => {
            const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
            inlineCodes.push(`<code class="inline-code">${this.escapeHtml(code)}</code>`);
            return placeholder;
        });
        
        // Step 3: Handle headers (before other formatting)
        parsed = parsed.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        parsed = parsed.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        parsed = parsed.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        
        // Step 4: Handle blockquotes
        parsed = parsed.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');
        
        // Step 5: Handle lists (improved regex)
        // Unordered lists
        parsed = parsed.replace(/^(\s*)[-*+]\s+(.+)$/gm, '$1<li>$2</li>');
        parsed = parsed.replace(/(<li>.*<\/li>(\s*<li>.*<\/li>)*)/gms, '<ul>$1</ul>');
        
        // Numbered lists (handle separately to avoid conflicts)
        parsed = parsed.replace(/^(\s*)\d+\.\s+(.+)$/gm, '$1<li class="numbered">$2</li>');
        parsed = parsed.replace(/(<li class="numbered">.*<\/li>(\s*<li class="numbered">.*<\/li>)*)/gms, (match) => {
            return '<ol>' + match.replace(/ class="numbered"/g, '') + '</ol>';
        });
        
        // Step 6: Handle bold text (before italic to avoid conflicts)
        parsed = parsed.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
        parsed = parsed.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
        
        // Step 7: Handle italic text
        parsed = parsed.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
        parsed = parsed.replace(/_([^_\n]+)_/g, '<em>$1</em>');
        
        // Step 8: Handle links
        parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Step 9: Handle line breaks and paragraphs
        // Split by double newlines for paragraphs
        const paragraphs = parsed.split(/\n\s*\n/);
        parsed = paragraphs.map(paragraph => {
            if (paragraph.trim()) {
                // Don't wrap if it's already a block element
                if (/^<(h[1-6]|div|ul|ol|blockquote|pre)/.test(paragraph.trim())) {
                    return paragraph.trim();
                }
                // Replace single newlines with <br> within paragraphs
                const withBreaks = paragraph.replace(/\n/g, '<br>');
                return `<p>${withBreaks}</p>`;
            }
            return '';
        }).filter(p => p).join('');
        
        // Step 10: Restore code blocks and inline code
        codeBlocks.forEach((code, index) => {
            parsed = parsed.replace(`__CODE_BLOCK_${index}__`, code);
        });
        inlineCodes.forEach((code, index) => {
            parsed = parsed.replace(`__INLINE_CODE_${index}__`, code);
        });
        
        return parsed;
    }
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add bot message to chat interface with rich formatting
    addBotMessage(message) {
        const messageObj = { type: 'bot', text: message, timestamp: new Date().toISOString() };
        this.chatHistory.push(messageObj);
        this.saveChatHistory();

        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message slide-up';

        const parsedMessage = this.parseMessage(message);

        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot bot-icon"></i>
                <div class="message-text">
                    ${parsedMessage}
                </div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    // Show typing indicator
    showTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'flex';
        this.scrollToBottom();
    }

    // Hide typing indicator
    hideTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'none';
    }

    // Scroll chat to bottom
    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Load chat messages from history
    loadChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        // Add welcome message if no history
        if (this.chatHistory.length === 0) {
            this.addWelcomeMessage();
        } else {
            // Load existing history
            this.chatHistory.forEach(msg => {
                if (msg.type === 'user') {
                    // Create user message element directly to avoid double-saving
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message user-message slide-up';

                    let imagePreview = '';
                    if (msg.image) {
                        imagePreview = `<img src="data:image/jpeg;base64,${msg.image}" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-bottom: 0.5rem;" alt="Uploaded image">`;
                    }

                    messageDiv.innerHTML = `
                        <div class="message-content">
                            <div class="message-text">
                                ${imagePreview}
                                ${msg.text ? `<p>${msg.text}</p>` : '<p><em>Sent an image</em></p>'}
                            </div>
                            <i class="fas fa-user user-icon"></i>
                        </div>
                    `;
                    
                    const chatMessages = document.getElementById('chatMessages');
                    chatMessages.appendChild(messageDiv);
                } else {
                    // Create bot message element directly to avoid double-saving
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message bot-message slide-up';
                    
                    const parsedMessage = this.parseMessage(msg.text);
                    
                    messageDiv.innerHTML = `
                        <div class="message-content">
                            <i class="fas fa-robot bot-icon"></i>
                            <div class="message-text">
                                ${parsedMessage}
                            </div>
                        </div>
                    `;
                    
                    const chatMessages = document.getElementById('chatMessages');
                    chatMessages.appendChild(messageDiv);
                }
            });
        }
    }

    // Add welcome message
    addWelcomeMessage() {
        const chatMessages = document.getElementById('chatMessages');
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'message bot-message slide-up';
        
        welcomeDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot bot-icon"></i>
                <div class="message-text">
                    <h5>Welcome ${this.currentUser?.fullName || 'User'}!</h5>
                    <p>Hi there! 👋 I'm your AI assistant with vision capabilities. I can chat about anything, analyze images, tell jokes, share facts, help with coding, answer questions, or play games. What's on your mind?</p>
                    <div class="quick-replies">
                        <button class="btn btn-quick-reply">Let's Chat!</button>
                        <button class="btn btn-quick-reply">Tell me a joke</button>
                        <button class="btn btn-quick-reply">Fun facts</button>
                        <button class="btn btn-quick-reply">Analyze an image</button>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(welcomeDiv);
    }

    // Save chat history to localStorage
    saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    }

    // Clear chat history
    async clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            try {
                // Clear backend session
                await fetch(`${this.BACKEND_URL}/api/clear-chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        session_id: this.sessionId
                    })
                });
            } catch (error) {
                console.error('Error clearing backend session:', error);
            }

            // Clear local data
            this.chatHistory = [];
            this.saveChatHistory();
            this.sessionId = this.generateSessionId();
            localStorage.setItem('chatSessionId', this.sessionId);
            
            // Reload chat interface
            this.loadChatMessages();
        }
    }

    // Show user profile
    showProfile() {
        if (this.currentUser) {
            document.getElementById('profileName').value = this.currentUser.fullName || 'N/A';
            document.getElementById('profileEmail').value = this.currentUser.email || 'N/A';
            document.getElementById('profileMemberSince').value = new Date().toLocaleDateString();
            document.getElementById('profileSessions').value = '1';
            
            const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
            profileModal.show();
        }
    }

    // Logout user
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.showPage('login');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatBotApp = new ChatBotApp();
});
