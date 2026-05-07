/**
 * Cart Management and Ordering Logic
 */

const Cart = {
    data: Storage.get('cart', []),

    updateCount: () => {
        const cartCount = document.getElementById('cartCount');
        if (!cartCount) return;
        const totalItems = Cart.data.reduce((sum, item) => sum + item.quantity, 0);
        
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.classList.remove('hidden');
        } else {
            cartCount.classList.add('hidden');
        }
    },

    add: (productId) => {
        // Combined products: static + seller added
        const sellerProducts = Storage.get('sellerProducts', []);
        const allProducts = [...(typeof INITIAL_PRODUCTS !== 'undefined' ? INITIAL_PRODUCTS : []), ...sellerProducts];
        
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            const existingItem = Cart.data.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                Cart.data.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }
            Storage.set('cart', Cart.data);
            Cart.updateCount();
            Cart.updateDisplay();
            if (typeof Store !== 'undefined') Store.loadProducts();
        }
    },

    updateQuantity: (productId, change) => {
        const item = Cart.data.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                Cart.remove(productId);
            } else {
                Storage.set('cart', Cart.data);
                Cart.updateCount();
                Cart.updateDisplay();
                if (typeof Store !== 'undefined') Store.loadProducts();
            }
        } else if (change > 0) {
            Cart.add(productId);
        }
    },

    remove: (productId) => {
        Cart.data = Cart.data.filter(item => item.id !== productId);
        Storage.set('cart', Cart.data);
        Cart.updateCount();
        Cart.updateDisplay();
        if (typeof Store !== 'undefined') Store.loadProducts();
    },

    updateDisplay: () => {
        const cartItems = document.getElementById('cartItems');
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        if (!cartItems || !subtotalElement || !totalElement) return;

        if (Cart.data.length === 0) {
            cartItems.innerHTML = '<p class="text-gray-500 text-center py-8">Your cart is empty</p>';
            subtotalElement.textContent = '₹0';
            totalElement.textContent = '₹0';
            return;
        }

        let subtotal = 0;
        cartItems.innerHTML = Cart.data.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return `
                <div class="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800">${item.name}</h4>
                        <p class="text-gray-600">₹${item.price} × ${item.quantity} = ₹${itemTotal}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="Cart.updateQuantity(${item.id}, -1)" class="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold text-lg">-</button>
                        <span class="w-16 text-center font-bold text-lg border-2 border-gray-300 rounded-lg py-1">${item.quantity}</span>
                        <button onclick="Cart.updateQuantity(${item.id}, 1)" class="w-10 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold text-lg">+</button>
                        <button onclick="Cart.remove(${item.id})" class="ml-2 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const deliveryFee = 20;
        const total = subtotal + deliveryFee;
        subtotalElement.textContent = `₹${subtotal}`;
        totalElement.textContent = `₹${total}`;
    },

    placeOrder: () => {
        if (Cart.data.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const user = Storage.get('currentUser', null);
        if (!user) {
            alert('Please login to place an order!');
            UI.hideModal('cartModal');
            UI.showModal('loginModal');
            return;
        }

        const deliveryRoom = document.getElementById('deliveryRoom').value;
        const deliveryMobile = document.getElementById('deliveryMobile').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        if (!deliveryRoom || !deliveryMobile) {
            alert('Please fill in delivery details!');
            return;
        }

        const subtotal = Cart.data.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const order = {
            id: Date.now(),
            userId: user.email,
            items: [...Cart.data],
            deliveryRoom,
            deliveryMobile,
            paymentMethod,
            subtotal,
            deliveryFee: 20,
            total: subtotal + 20,
            status: 'pending',
            date: new Date().toISOString()
        };

        const orders = Storage.get('orders', []);
        orders.push(order);
        Storage.set('orders', orders);

        Cart.data = [];
        Storage.set('cart', []);
        Cart.updateCount();
        
        alert(`Order placed successfully! Total: ₹${order.total}.`);
        UI.hideModal('cartModal');
    }
};

window.Cart = Cart;
window.addToCart = Cart.add;
window.updateProductQuantity = Cart.updateQuantity;
window.updateQuantity = Cart.updateQuantity;
window.removeFromCart = Cart.remove;
window.placeOrder = Cart.placeOrder;
window.openCartModal = () => { Cart.updateDisplay(); UI.showModal('cartModal'); };
window.closeCartModal = () => UI.hideModal('cartModal');
