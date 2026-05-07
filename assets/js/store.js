/**
 * Store UI and Product Rendering Logic
 */

const Store = {
    init: () => {
        Store.loadProducts();
        Cart.updateCount();
    },

    loadProducts: () => {
        const user = Storage.get('currentUser', null);
        const isSeller = user && user.category === 'seller';
        
        const sellerProducts = Storage.get('sellerProducts', []);
        const allProducts = [...(typeof INITIAL_PRODUCTS !== 'undefined' ? INITIAL_PRODUCTS : []), ...sellerProducts];
        
        const grid = document.getElementById('userProductGrid');
        if (!grid) return;

        if (isSeller) {
            document.getElementById('sellerSidebar').classList.remove('hidden');
            document.getElementById('userProductGrid').classList.add('hidden');
            document.getElementById('sellerContent').classList.remove('hidden');
            if (typeof Seller !== 'undefined') Seller.showDashboard();
        } else {
            document.getElementById('sellerSidebar').classList.add('hidden');
            document.getElementById('userProductGrid').classList.remove('hidden');
            document.getElementById('sellerContent').classList.add('hidden');
            
            grid.innerHTML = '';
            allProducts.forEach(product => {
                const cartItem = Cart.data.find(item => item.id === product.id);
                const quantity = cartItem ? cartItem.quantity : 0;
                
                const card = document.createElement('div');
                card.className = 'bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300';
                
                let controlsHTML = quantity > 0 
                    ? `
                        <div class="flex items-center space-x-2">
                            <button onclick="Cart.updateQuantity(${product.id}, -1)" class="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-bold text-lg">-</button>
                            <span class="flex-1 text-center font-bold text-lg border-2 border-gray-300 rounded-lg py-1">${quantity}</span>
                            <button onclick="Cart.updateQuantity(${product.id}, 1)" class="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-bold text-lg">+</button>
                        </div>
                    `
                    : `
                        <button onclick="Cart.add(${product.id})" class="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                            Add to Cart
                        </button>
                    `;
                
                card.innerHTML = `
                    <div class="w-full h-40 overflow-hidden rounded-lg mb-4">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                    </div>
                    <h3 class="font-semibold text-gray-800">${product.name}</h3>
                    <p class="text-gray-600 text-sm">${product.description}</p>
                    <p class="mt-2 text-lg font-bold text-green-600">₹${product.price}</p>
                    ${controlsHTML}
                `;
                grid.appendChild(card);
            });
        }
    },

    handleSettingsUpdate: (event) => {
        event.preventDefault();
        const user = Storage.get('currentUser', null);
        const formData = new FormData(event.target);
        
        if (formData.get('currentPassword') !== user.password) {
            alert('Current password incorrect.');
            return;
        }
        
        const updatedUser = {
            ...user,
            name: formData.get('name'),
            email: formData.get('email'),
            mobile: formData.get('mobile'),
            room: formData.get('room'),
            password: formData.get('newPassword') || user.password
        };
        
        const users = Storage.get('users', []);
        const idx = users.findIndex(u => u.email === user.email);
        if (idx !== -1) {
            users[idx] = updatedUser;
            Storage.set('users', users);
            Storage.set('currentUser', updatedUser);
            alert('Settings updated!');
            UI.hideModal('settingsModal');
            window.location.reload();
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
