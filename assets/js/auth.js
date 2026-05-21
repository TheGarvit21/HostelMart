/**
 * Authentication and User Session Management (Attached to Express + MongoDB Backend)
 */

const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:5000/api';

const Auth = {
    init: async () => {
        const token = Cookie.get('token');
        const user = Storage.get('currentUser', null);
        
        if (token) {
            try {
                // Verify token with backend and fetch latest profile
                const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Update locally stored user data with latest from DB
                    Storage.set('currentUser', data.user);
                    Auth.updateUI(data.user.name);
                } else {
                    // Token is invalid/expired or user deleted, clear local storage session
                    console.warn('[Auth] Token is invalid or expired. Logging out.');
                    Auth.clearLocalSession();
                }
            } catch (error) {
                console.error('[Auth] Error fetching profile:', error);
                // In case of network errors, we can fallback to locally stored info to maintain UX
                if (user) {
                    Auth.updateUI(user.name);
                }
            }
        }
    },

    handleLogin: async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Cookie.set('token', data.token);
                Storage.set('currentUser', data.user);
                
                alert(`Welcome back, ${data.user.name}!`);
                UI.hideModal('loginModal');
                Auth.updateUI(data.user.name);
                // Reload to update roles (seller/user)
                window.location.reload();
            } else {
                alert(data.message || 'Invalid email or password.');
            }
        } catch (error) {
            console.error('[Auth] Login error:', error);
            alert('Connection error. Please check your internet connection and try again.');
        }
    },

    handleSignUp: async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            mobile: formData.get('mobile'),
            room: formData.get('room'),
            category: formData.get('category')
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Cookie.set('token', data.token);
                Storage.set('currentUser', data.user);
                
                alert(`Welcome, ${data.user.name}! Account created successfully.`);
                UI.hideModal('loginModal');
                Auth.updateUI(data.user.name);
                window.location.reload();
            } else {
                alert(data.message || 'Registration failed.');
            }
        } catch (error) {
            console.error('[Auth] Sign up error:', error);
            alert('Connection error. Please check your internet connection and try again.');
        }
    },

    logout: () => {
        Auth.clearLocalSession();
        Auth.hideUserAvatar();
        window.location.href = 'index.html';
    },

    clearLocalSession: () => {
        Cookie.remove('token');
        Storage.remove('currentUser');
        Auth.hideUserAvatar();
    },

    getInitials: (name) => {
        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        return words.map(word => word[0]).join('').toUpperCase().substring(0, 2);
    },

    updateUI: (userName) => {
        const user = Storage.get('currentUser', null);
        const loginButton = document.getElementById('loginButton');
        const userAvatar = document.getElementById('userAvatar');
        const userInitials = document.getElementById('userInitials');
        const userNameDisplay = document.getElementById('userName');
        const userEmailDisplay = document.getElementById('userEmail');

        if (loginButton && userAvatar) {
            // Hide login button and show user avatar
            loginButton.classList.add('hidden');
            userAvatar.classList.remove('hidden');

            // Set initials
            if (userInitials) {
                userInitials.textContent = Auth.getInitials(userName);
            }

            // Set user name and email in dropdown
            if (userNameDisplay && user) {
                userNameDisplay.textContent = user.name || userName;
            }
            if (userEmailDisplay && user) {
                userEmailDisplay.textContent = user.email || '';
            }
        }
    },

    hideUserAvatar: () => {
        const loginButton = document.getElementById('loginButton');
        const userAvatar = document.getElementById('userAvatar');

        if (loginButton && userAvatar) {
            // Show login button and hide user avatar
            loginButton.classList.remove('hidden');
            userAvatar.classList.add('hidden');
        }
    }
};

// Global hooks for HTML onclick attributes
window.Auth = Auth;
window.handleLogin = Auth.handleLogin;
window.handleSignUp = Auth.handleSignUp;
window.logout = Auth.logout;
window.openLoginModal = () => UI.showModal('loginModal');
window.closeLoginModal = () => UI.hideModal('loginModal');
window.showLoginForm = () => {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginTab').classList.add('text-green-600', 'border-b-2', 'border-green-600');
    document.getElementById('loginTab').classList.remove('text-gray-600');
    document.getElementById('signupTab').classList.remove('text-green-600', 'border-b-2', 'border-green-600');
    document.getElementById('signupTab').classList.add('text-gray-600');
};
window.showSignUpForm = () => {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('signupTab').classList.add('text-green-600', 'border-b-2', 'border-green-600');
    document.getElementById('signupTab').classList.remove('text-gray-600');
    document.getElementById('loginTab').classList.remove('text-green-600', 'border-b-2', 'border-green-600');
    document.getElementById('loginTab').classList.add('text-gray-600');
};
