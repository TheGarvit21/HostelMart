/**

 * Store UI and Product Rendering Logic

 */



const Store = {
    currentCategory: 'all',

    init: async () => {
        await Store.loadProducts();
        Cart.updateCount();
    },

    filterByCategory: (category) => {
        Store.currentCategory = category;

        // Update button styles
        document.querySelectorAll('.category-btn').forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.remove('bg-gray-200', 'text-gray-700');
                btn.classList.add('bg-green-500', 'text-white');
            } else {
                btn.classList.remove('bg-green-500', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            }
        });

        // Reload products with filter
        Store.loadProducts();
    },



    loadProducts: async () => {

        const user = Storage.get('currentUser', null);

        const isSeller = user && user.category === 'seller';

        

        const grid = document.getElementById('userProductGrid');

        if (!grid) return;



        if (isSeller) {

            document.getElementById('sellerSidebar').classList.remove('hidden');

            document.getElementById('userProductGrid').classList.add('hidden');

            document.getElementById('sellerContent').classList.remove('hidden');

            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.classList.add('hidden');
            }

            if (typeof Seller !== 'undefined') await Seller.showDashboard();

        } else {

            document.getElementById('sellerSidebar').classList.add('hidden');

            document.getElementById('userProductGrid').classList.remove('hidden');

            document.getElementById('sellerContent').classList.add('hidden');

            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.classList.remove('hidden');
            }

            grid.innerHTML = `

                <div class="col-span-full flex flex-col items-center justify-center p-12">

                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>

                    <span class="mt-3 text-gray-600 font-semibold">Loading live snack inventory from MongoDB...</span>

                </div>

            `;

            

            const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:5000/api';

            try {

                const response = await fetch(`${API_BASE_URL}/products`);

                const data = await response.json();

                

                const allProducts = data.success ? data.products : [];

                window.ALL_PRODUCTS = allProducts; // Bind globally for cart matches

                // Filter products by category if a category is selected
                let filteredProducts = allProducts;
                if (Store.currentCategory !== 'all') {
                    filteredProducts = allProducts.filter(product => {
                        const productCategory = product.category || 'Snacks';
                        return productCategory === Store.currentCategory;
                    });
                }

                grid.innerHTML = '';

                // Group products by category
                const groupedProducts = {};
                filteredProducts.forEach(product => {
                    // Only use fallback if category is truly missing or empty
                    const category = product.category && product.category.trim() !== '' ? product.category : 'Snacks';
                    if (!groupedProducts[category]) {
                        groupedProducts[category] = [];
                    }
                    groupedProducts[category].push(product);
                });

                // Display products by category
                Object.keys(groupedProducts).forEach(category => {
                    // Add category header
                    const categoryHeader = document.createElement('div');
                    categoryHeader.className = 'col-span-full mt-6 mb-4';
                    categoryHeader.innerHTML = `
                        <h2 class="text-2xl font-bold text-green-600 capitalize flex items-center">
                            <span class="w-1 h-8 bg-green-500 mr-3 rounded-full"></span>
                            ${category}
                        </h2>
                    `;
                    grid.appendChild(categoryHeader);

                    // Add products in this category
                    groupedProducts[category].forEach(product => {
                        const idStr = product._id || product.id;
                        const cartItem = Cart.data.find(item => item.id === idStr);
                        const quantity = cartItem ? cartItem.quantity : 0;

                        const card = document.createElement('div');
                        card.className = 'bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition-all duration-200 flex flex-col';

                        let controlsHTML = quantity > 0
                            ? `
                                <div class="flex items-center border border-green-500 rounded-lg overflow-hidden">
                                    <button onclick="Cart.updateQuantity('${idStr}', -1)" class="px-3 py-2 bg-green-500 text-white hover:bg-green-600 transition-colors">-</button>
                                    <span class="px-4 py-2 font-semibold text-green-700 bg-green-50">${quantity}</span>
                                    <button onclick="Cart.updateQuantity('${idStr}', 1)" class="px-3 py-2 bg-green-500 text-white hover:bg-green-600 transition-colors">+</button>
                                </div>
                            `
                            : `
                                <button onclick="Cart.add('${idStr}')" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold">
                                    ADD
                                </button>
                            `;

                        card.innerHTML = `
                            <div class="p-4">
                                <div class="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain mix-blend-multiply">
                                </div>
                                <h3 class="font-medium text-gray-800 text-sm mb-1 line-clamp-2 h-10">${product.name}</h3>
                                <div class="flex items-baseline gap-2 mb-2">
                                    <span class="text-lg font-bold text-gray-900">₹${product.price}</span>
                                    ${product.deliveryFee > 0 ? `<span class="text-xs text-gray-500">+ ₹${product.deliveryFee} delivery</span>` : ''}
                                </div>
                                <p class="text-xs text-gray-500 mb-3">${product.description}</p>
                                ${controlsHTML}
                            </div>
                        `;
                        grid.appendChild(card);
                    });
                });

                if (allProducts.length === 0) {
                    grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-12 font-semibold">No products available in database inventory.</div>';
                }
            } catch (error) {
                console.error('[Store] Product retrieval error:', error);
                grid.innerHTML = '<div class="col-span-full text-center text-red-600 py-12 font-bold">Failed to load snack menu. Backend server disconnected.</div>';
            }
        }
    },

    handleSettingsUpdate: async (event) => {

        event.preventDefault();

        const token = Cookie.get('token');

        if (!token) {

            alert('Session expired. Please log in again.');

            return;

        }



        const formData = new FormData(event.target);

        const payload = {

            name: formData.get('name'),

            email: formData.get('email'),

            mobile: formData.get('mobile'),

            room: formData.get('room'),

            currentPassword: formData.get('currentPassword'),

            newPassword: formData.get('newPassword') || undefined

        };

        

        try {

            const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:5000/api';

            const response = await fetch(`${API_BASE_URL}/auth/update`, {

                method: 'PUT',

                headers: {

                    'Content-Type': 'application/json',

                    'Authorization': `Bearer ${token}`

                },

                body: JSON.stringify(payload)

            });



            const data = await response.json();



            if (response.ok && data.success) {

                Storage.set('currentUser', data.user);

                alert('Settings updated successfully!');

                UI.hideModal('settingsModal');

                window.location.reload();

            } else {

                alert(data.message || 'Failed to update settings.');

            }

        } catch (error) {

            console.error('[Store] Settings update error:', error);

            alert('Connection error. Please check your internet connection and try again.');

        }

    }

};



window.Store = Store;

window.handleSettingsUpdate = Store.handleSettingsUpdate;
window.filterByCategory = Store.filterByCategory;

window.openSettingsModal = () => {

    const user = Storage.get('currentUser', null);

    if (user) {

        document.getElementById('settingsName').value = user.name;

        document.getElementById('settingsEmail').value = user.email;

        document.getElementById('settingsMobile').value = user.mobile;

        document.getElementById('settingsRoom').value = user.room;

        UI.showModal('settingsModal');

    }

};

window.closeSettingsModal = () => UI.hideModal('settingsModal');



// Initialize on load

document.addEventListener('DOMContentLoaded', () => {

    Auth.init();

    Store.init();

});

