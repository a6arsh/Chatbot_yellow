// Store registered users in localStorage
let users = JSON.parse(localStorage.getItem('users')) || [];

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Registration Form Handler
    if (registerForm) {
        const password = registerForm.querySelector('#password');
        const confirmPassword = registerForm.querySelector('#confirmPassword');

        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = registerForm.querySelector('#email').value;
            const fullName = registerForm.querySelector('#fullName').value;
            
            // Validate form
            if (!validateRegistration(fullName, email, password.value, confirmPassword.value)) {
                return;
            }

            // Check if user already exists
            if (users.find(user => user.email === email)) {
                showError('email', 'This email is already registered');
                return;
            }

            // Add new user
            users.push({
                fullName: fullName,
                email: email,
                password: password.value // In a real app, this should be hashed
            });

            // Save to localStorage
            localStorage.setItem('users', JSON.stringify(users));

            // Show success message
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        });

        // Password strength indicator
        password.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });

        confirmPassword.addEventListener('input', function() {
            if (this.value !== password.value) {
                showError('confirmPassword', 'Passwords do not match');
            } else {
                clearError('confirmPassword');
            }
        });
    }

    // Login Form Handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = loginForm.querySelector('#email').value;
            const password = loginForm.querySelector('#password').value;

            // Find user
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Store login state
                localStorage.setItem('currentUser', JSON.stringify({
                    fullName: user.fullName,
                    email: user.email
                }));
                
                // Redirect to chatbot
                window.location.href = 'chatbot.html';
            } else {
                alert('Invalid email or password');
            }
        });
    }
});

// Check if user is logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser && !window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
        window.location.href = 'login.html';
    }
}

// Run auth check on every page
checkAuth();

// Validation functions
function validateRegistration(fullName, email, password, confirmPassword) {
    let isValid = true;

    if (!fullName || fullName.length < 2) {
        showError('fullName', 'Please enter your full name');
        isValid = false;
    } else {
        clearError('fullName');
    }

    if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearError('email');
    }

    if (!password || password.length < 8) {
        showError('password', 'Password must be at least 8 characters long');
        isValid = false;
    } else {
        clearError('password');
    }

    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        isValid = false;
    } else {
        clearError('confirmPassword');
    }

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    
    const feedback = field.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = message;
        feedback.style.display = 'block';
    }
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    
    const feedback = field.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.style.display = 'none';
    }
}

function updatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthIndicator = document.querySelector('.password-strength');
    if (strengthIndicator) {
        strengthIndicator.className = 'password-strength';
        
        if (strength === 0) {
            strengthIndicator.classList.add('strength-weak');
        } else if (strength <= 2) {
            strengthIndicator.classList.add('strength-medium');
        } else {
            strengthIndicator.classList.add('strength-strong');
        }
    }
}
