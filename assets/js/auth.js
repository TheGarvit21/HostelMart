/**

 * Authentication and User Session Management (Attached to Express + MongoDB Backend)

 */



const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:5000/api';



const Auth = {

    init: async () => {

        const token = Cookie.get('token');

        const user = Storage.get('currentUser', null);



        // Check for seller status immediately and hide hero banner

        const heroBanner = document.getElementById('heroBanner');

        if (user && (user.role === 'seller' || user.category === 'seller') && heroBanner) {

            heroBanner.style.display = 'none';

        }



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



                    // If seller is logged in and on index.html, show seller dashboard

                    if ((data.user.role === 'seller' || data.user.category === 'seller') && window.location.pathname.includes('index.html')) {

                        setTimeout(() => {

                            showSellerDashboard();

                        }, 100);

                    }

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



                    // If seller is logged in and on index.html, show seller dashboard

                    if ((user.role === 'seller' || user.category === 'seller') && window.location.pathname.includes('index.html')) {

                        setTimeout(() => {

                            showSellerDashboard();

                        }, 100);

                    }

                }

            }

        }



        // Check for seller status on page load and hide hero banner if seller is logged in

        const heroBannerCheck = document.getElementById('heroBanner');

        if (heroBannerCheck && Auth.isSeller()) {

            heroBannerCheck.style.display = 'none';

        }



        // Additional check after a short delay to ensure hero banner is hidden

        setTimeout(() => {

            const heroBannerCheck2 = document.getElementById('heroBanner');

            if (heroBannerCheck2 && Auth.isSeller()) {

                heroBannerCheck2.style.display = 'none';

            }

        }, 500);

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

                console.log('[Auth] Login successful. User data:', data.user);
                console.log('[Auth] User role:', data.user.role);
                console.log('[Auth] User category:', data.user.category);

                alert(`Welcome back, ${data.user.name}!`);
                UI.hideModal('loginModal');
                Auth.updateUI(data.user.name);

                // Check if user is seller and redirect to seller dashboard
                const isSeller = data.user.role === 'seller' || data.user.category === 'seller';
                console.log('[Auth] Is seller?', isSeller);

                if (isSeller) {
                    console.log('[Auth] Redirecting to seller dashboard');
                    // Seller: show seller dashboard immediately
                    // Force hide user product grid and show seller content
                    const userProductGrid = document.getElementById('userProductGrid');
                    const sellerContent = document.getElementById('sellerContent');
                    const sellerSidebar = document.getElementById('sellerSidebar');
                    const categoryFilter = document.getElementById('categoryFilter');
                    
                    console.log('[Auth] DOM elements:', { userProductGrid, sellerContent, sellerSidebar, categoryFilter });
                    
                    if (userProductGrid) userProductGrid.classList.add('hidden');
                    if (sellerContent) sellerContent.classList.remove('hidden');
                    if (sellerSidebar) sellerSidebar.classList.remove('hidden');
                    if (categoryFilter) categoryFilter.classList.add('hidden');
                    
                    setTimeout(() => {
                        console.log('[Auth] Calling showSellerDashboard');
                        showSellerDashboard();
                    }, 100);
                } else {
                    // Regular user: reload to update roles
                    console.log('[Auth] Regular user, reloading page');
                    window.location.reload();
                }

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

                // Check if user is seller and redirect to seller dashboard
                if (data.user.role === 'seller' || data.user.category === 'seller') {
                    // Seller: show seller dashboard immediately
                    // Force hide user product grid and show seller content
                    const userProductGrid = document.getElementById('userProductGrid');
                    const sellerContent = document.getElementById('sellerContent');
                    const sellerSidebar = document.getElementById('sellerSidebar');
                    const categoryFilter = document.getElementById('categoryFilter');
                    
                    if (userProductGrid) userProductGrid.classList.add('hidden');
                    if (sellerContent) sellerContent.classList.remove('hidden');
                    if (sellerSidebar) sellerSidebar.classList.remove('hidden');
                    if (categoryFilter) categoryFilter.classList.add('hidden');
                    
                    setTimeout(() => {
                        showSellerDashboard();
                    }, 100);
                } else {
                    // Regular user: reload to update roles
                    window.location.reload();
                }

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

        const heroBanner = document.getElementById('heroBanner');



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



            // Hide hero banner if seller is logged in

            if (heroBanner && Auth.isSeller()) {

                heroBanner.style.display = 'none';

            }

        }

    },



    hideUserAvatar: () => {

        const loginButton = document.getElementById('loginButton');

        const userAvatar = document.getElementById('userAvatar');

        const heroBanner = document.getElementById('heroBanner');



        if (loginButton && userAvatar) {

            // Show login button and hide user avatar

            loginButton.classList.remove('hidden');

            userAvatar.classList.add('hidden');

        }



        // Show hero banner when user logs out

        if (heroBanner) {

            heroBanner.style.display = 'block';

        }

    },

    isSeller: () => {
        const user = Storage.get('currentUser', null);
        return user && (user.role === 'seller' || user.category === 'seller');
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

