/**
 * Store UI and Product Rendering Logic
 */

const Store = {
    init: async () => {
        await Store.loadProducts();
        Cart.updateCount();
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
            if (typeof Seller !== 'undefined') await Seller.showDashboard();
        } else {
            document.getElementById('sellerSidebar').classList.add('hidden');
            document.getElementById('userProductGrid').classList.remove('hidden');
            document.getElementById('sellerContent').classList.add('hidden');
            
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
                
                grid.innerHTML = '';
                allProducts.forEach(product => {
                    const idStr = product._id || product.id;
                    const cartItem = Cart.data.find(item => item.id === idStr);
                    const quantity = cartItem ? cartItem.quantity : 0;
                    
                    const card = document.createElement('div');
                    card.className = 'bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between';
                    
                    let controlsHTML = quantity > 0 
                        ? `
                            <div class="flex items-center space-x-2 mt-3">
                                <button onclick="Cart.updateQuantity('${idStr}', -1)" class="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-bold text-lg">-</button>
                                <span class="flex-1 text-center font-bold text-lg border-2 border-gray-300 rounded-lg py-1">${quantity}</span>
                                <button onclick="Cart.updateQuantity('${idStr}', 1)" class="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-bold text-lg">+</button>
                            </div>
                        `
                        : `
                            <button onclick="Cart.add('${idStr}')" class="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold">
                                Add to Cart
                            </button>
                        `;
                    
                    card.innerHTML = `
                        <div>
                            <div class="w-full h-40 overflow-hidden rounded-lg mb-4">
                                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                            </div>
                            <h3 class="font-semibold text-gray-800">${product.name}</h3>
                            <p class="text-gray-600 text-sm mt-1 h-12 overflow-hidden">${product.description}</p>
                        </div>
                        <div>
                            <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                <div>
                                    <p class="text-lg font-bold text-green-600">₹${product.price}</p>
                                    <span class="text-[10px] text-gray-500 font-semibold block -mt-1">
                                        ${product.deliveryFee > 0 ? `+ ₹${product.deliveryFee} Delivery / item` : 'Free Delivery'}
                                    </span>
                                </div>
                                <span class="text-xs text-gray-400">Seller: ${(product.seller && product.seller.name) || 'Store'}</span>
                            </div>
                            ${controlsHTML}
                        </div>
                    `;
                    grid.appendChild(card);
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
            alert('Failed to connect to authentication server. Please ensure backend is running.');
        }
    }
};

window.Store = Store;
window.handleSettingsUpdate = Store.handleSettingsUpdate;
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
