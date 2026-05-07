/**
 * Authentication and User Session Management
 */

const Auth = {
    init: () => {
        const user = Storage.get('currentUser', null);
        if (user) {
            Auth.updateUI(user.name);
        }
    },

    handleLogin: (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        const users = Storage.get('users', []);
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            Storage.set('currentUser', user);
            alert(`Welcome back ${user.name}!`);
            UI.hideModal('loginModal');
            Auth.updateUI(user.name);
            // Reload to update roles (seller/user)
            window.location.reload();
        } else {
            alert('Invalid email or password.');
        }
    },

    handleSignUp: (event) => {
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
        
        const users = Storage.get('users', []);
        if (users.find(u => u.email === userData.email)) {
            alert('Account already exists. Please login.');
            return;
        }
        
        users.push(userData);
        Storage.set('users', users);
        Storage.set('currentUser', userData);
        
        alert(`Welcome ${userData.name}! Account created.`);
        UI.hideModal('loginModal');
        Auth.updateUI(userData.name);
        window.location.reload();
    },

    logout: () => {
        Storage.remove('currentUser');
        window.location.href = 'index.html';
    },

    updateUI: (userName) => {
        const loginButton = document.querySelector('button[onclick="openLoginModal()"]');
        if (loginButton) {
            loginButton.innerHTML = `
                <div class="relative group">
                    <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span>${userName}</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                    <div class="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div class="py-1">
                            <button onclick="UI.showModal('settingsModal')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.94-1.543-.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                Settings
                            </button>
                            <button onclick="Auth.logout()" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            `;
            loginButton.removeAttribute('onclick');
        }
    }
};

// Global hooks for HTML onclick attributes
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
