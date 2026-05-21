/**
 * Seller Panel Logic (Fully Database-backed & Secured)
 */

const Seller = {
    showDashboard: async () => {
        const content = document.getElementById('sellerContent');
        if (!content) return;

        const token = Cookie.get('token');
        if (!token) {
            alert('Session expired. Please log in again.');
            window.location.href = 'login.html';
            return;
        }

        const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:5000/api';

        // Add a clean loading state to the screen
        content.innerHTML = `
            <div class="flex items-center justify-center p-12">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                <span class="ml-3 text-gray-600 font-semibold">Retrieving dashboard records from database...</span>
            </div>
        `;

        try {
            // 1. Fetch seller's products from MongoDB
            const prodRes = await fetch(`${API_BASE_URL}/products/seller`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const prodData = await prodRes.json();
            const sellerProducts = prodData.success ? prodData.products : [];

            // 2. Fetch seller's orders from MongoDB
            const orderRes = await fetch(`${API_BASE_URL}/orders/seller`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const orderData = await orderRes.json();
            const orders = orderData.success ? orderData.orders : [];

            // Calculate aggregate dashboard metrics
            const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
            const totalItemsSold = orders.reduce((sum, order) => {
                return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
            }, 0);

            content.innerHTML = `
                <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Seller Dashboard</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Total Products Interactive Card -->
                        <div onclick="Seller.showMyProducts()" class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-green-500 transition-all duration-150 group">
                            <p class="text-sm text-gray-600 group-hover:text-green-600 transition-colors font-medium">Total Products</p>
                            <div class="flex justify-between items-end mt-2">
                                <p class="text-2xl font-bold text-green-600">${sellerProducts.length}</p>
                                <span class="text-xs text-green-600 group-hover:underline flex items-center font-semibold">
                                    View Catalog
                                    <svg class="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <p class="text-sm text-gray-600 font-medium">Total Revenue</p>
                            <p class="text-2xl font-bold text-green-600 mt-2">₹${totalRevenue}</p>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <p class="text-sm text-gray-600 font-medium">Items Sold</p>
                            <p class="text-2xl font-bold text-green-600 mt-2">${totalItemsSold}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="font-bold text-gray-800">Recent Delivery Orders</h3>
                        ${orders.some(o => o.status === 'pending') ?
                    `<button onclick="Seller.markAllDelivered()" class="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-semibold transition duration-150">Mark All Delivered</button>`
                    : ''
                }
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-gray-50 text-gray-600 text-sm">
                                <tr>
                                    <th class="p-4">Order ID</th>
                                    <th class="p-4">Buyer Name</th>
                                    <th class="p-4">Delivery Room</th>
                                    <th class="p-4">Mobile</th>
                                    <th class="p-4">Items Ordered</th>
                                    <th class="p-4">Delivery Fee</th>
                                    <th class="p-4">Total Price</th>
                                    <th class="p-4">Status</th>
                                    <th class="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${orders.map(order => `
                                    <tr class="text-sm hover:bg-gray-50 transition duration-100">
                                        <td class="p-4 font-mono text-xs text-gray-500">#${order._id.toString().slice(-6)}</td>
                                        <td class="p-4 font-medium text-gray-800">${(order.buyer && order.buyer.name) || 'Guest User'}</td>
                                        <td class="p-4 text-gray-700">${order.deliveryRoom || 'N/A'}</td>
                                        <td class="p-4 text-gray-700 font-mono">${order.deliveryMobile || 'N/A'}</td>
                                        <td class="p-4 text-gray-700">${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
                                        <td class="p-4 font-semibold text-gray-700">${order.deliveryFee > 0 ? `₹${order.deliveryFee}` : '<span class="text-green-600 font-bold">Free</span>'}</td>
                                        <td class="p-4 font-bold text-gray-800">₹${order.total}</td>
                                        <td class="p-4">
                                            <span class="px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                                                ${order.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td class="p-4">
                                             <select onchange="Seller.updateStatus('${order._id}', this.value)" class="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 cursor-pointer">
                                                 <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>PENDING</option>
                                                 <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>DELIVERED</option>
                                             </select>
                                         </td>
                                    </tr>
                                `).join('')}
                                ${orders.length === 0 ? '<tr><td colspan="8" class="p-8 text-center text-gray-500 font-semibold">No orders placed yet.</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[SellerDashboard] Connection Error:', error);
            content.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p class="text-red-700 font-bold mb-2">Database Connection Failed</p>
                    <p class="text-sm text-red-500">Failed to connect to the authentication server. Please ensure the backend server is running.</p>
                </div>
            `;
        }

        // Update navigation UI buttons highlights
        document.getElementById('dashboardBtn')?.classList.add('bg-green-600', 'text-white');
        document.getElementById('addProductBtn')?.classList.remove('bg-green-600', 'text-white');
    },

    showMyProducts: async () => {
        const content = document.getElementById('sellerContent');
        if (!content) return;

        const token = Cookie.get('token');
        if (!token) {
            alert('Session expired. Please log in again.');
            window.location.href = 'login.html';
            return;
        }

        const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:5000/api';

        // Add a clean loading state to the screen
        content.innerHTML = `
            <div class="flex items-center justify-center p-12">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                <span class="ml-3 text-gray-600 font-semibold">Retrieving your products from database...</span>
            </div>
        `;

        try {
            const response = await fetch(`${API_BASE_URL}/products/seller`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            const products = data.success ? data.products : [];
            Seller.currentSellerProducts = products;

            content.innerHTML = `
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <button onclick="Seller.showDashboard()" class="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center mb-2">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            Back to Dashboard
                        </button>
                        <h2 class="text-2xl font-bold text-gray-800">My Product Catalog</h2>
                    </div>
                    <button onclick="Seller.showAddProductForm()" class="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-150 shadow flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Add New Product</span>
                    </button>
                </div>

                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-gray-50 text-gray-600 text-sm">
                                <tr>
                                    <th class="p-4">Image</th>
                                    <th class="p-4">Name</th>
                                    <th class="p-4">Description</th>
                                    <th class="p-4">Price</th>
                                    <th class="p-4">Delivery Fee</th>
                                    <th class="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${products.map(product => `
                                    <tr class="hover:bg-gray-50 transition duration-100">
                                        <td class="p-4 w-20">
                                            <img src="${product.image}" alt="${product.name}" class="w-12 h-12 object-cover rounded-lg border border-gray-200 shadow-sm">
                                        </td>
                                        <td class="p-4 font-semibold text-gray-800">${product.name}</td>
                                        <td class="p-4 text-gray-600 text-sm max-w-xs truncate">${product.description}</td>
                                        <td class="p-4 font-bold text-green-600">₹${product.price}</td>
                                        <td class="p-4 text-gray-700 font-semibold">${product.deliveryFee > 0 ? `₹${product.deliveryFee}` : '<span class="text-green-600 font-bold">Free</span>'}</td>
                                        <td class="p-4 flex items-center space-x-2">
                                            <button onclick="Seller.showEditProductForm('${product._id}')" class="text-green-600 hover:text-green-700 font-semibold hover:bg-green-50 px-3 py-1 rounded-lg transition duration-150">
                                                Edit
                                            </button>
                                            <button onclick="Seller.deleteProduct('${product._id}')" class="text-red-500 hover:text-red-700 font-semibold hover:bg-red-50 px-3 py-1 rounded-lg transition duration-150">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                                ${products.length === 0 ? '<tr><td colspan="5" class="p-8 text-center text-gray-500 font-semibold">No products listed. Add a product to start selling!</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[SellerMyProducts] Connection Error:', error);
            content.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p class="text-red-700 font-bold mb-2">Failed to Load Products</p>
                    <p class="text-sm text-red-500">Connection to backend server timed out.</p>
                </div>
            `;
        }

        // De-highlight other sidebar tabs
        document.getElementById('addProductBtn')?.classList.remove('bg-green-600', 'text-white');
        document.getElementById('dashboardBtn')?.classList.remove('bg-green-600', 'text-white');
    },

    deleteProduct: async (productId) => {
        if (!confirm('Are you sure you want to delete this product from database catalog?')) {
            return;
        }

        const token = Cookie.get('token');
        if (!token) return;

        const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:5000/api';

        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                alert('Product deleted successfully!');
                Seller.showMyProducts();
            } else {
                alert(data.message || 'Failed to delete product.');
            }
        } catch (error) {
            console.error('[DeleteProduct] Connection Error:', error);
            alert('Failed to connect to the backend server.');
        }
    },

    showEditProductForm: (productId) => {
        const content = document.getElementById('sellerContent');
        if (!content) return;

        const products = Seller.currentSellerProducts || [];
        const product = products.find(p => p._id === productId);

        if (!product) {
            alert('Product details not found.');
            Seller.showMyProducts();
            return;
        }

        content.innerHTML = `
            <div class="mb-6">
                <button onclick="Seller.showMyProducts()" class="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center mb-2">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Catalog
                </button>
                <h2 class="text-2xl font-bold text-gray-800">Edit Product</h2>
            </div>

            <div class="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl">
                <form onsubmit="Seller.handleUpdateProduct(event, '${product._id}')" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input type="text" name="name" required value="${product.name}" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none h-24">${product.description}</textarea>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input type="number" name="price" required min="1" value="${product.price}" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (₹)</label>
                            <input type="number" name="deliveryFee" required min="0" value="${product.deliveryFee || 0}" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input type="url" name="image" required value="${product.image}" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                        </div>
                    </div>
                    <div class="flex items-center space-x-4 pt-2">
                        <button type="submit" class="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition duration-150 shadow">
                            Save Changes
                        </button>
                        <button type="button" onclick="Seller.showMyProducts()" class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-150">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
    },

    handleUpdateProduct: async (event, productId) => {
        event.preventDefault();
        const token = Cookie.get('token');
        if (!token) {
            alert('Session expired. Please log in again.');
            window.location.href = 'login.html';
            return;
        }

        const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:5000/api';
        const formData = new FormData(event.target);

        const payload = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            deliveryFee: parseFloat(formData.get('deliveryFee') || 0),
            image: formData.get('image')
        };

        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Product updated successfully!');
                Seller.showMyProducts();
            } else {
                alert(data.message || 'Failed to update product.');
            }
        } catch (error) {
            console.error('[UpdateProduct] Connection Error:', error);
            alert('Failed to connect to the backend server. Please verify connections.');
        }
    },

    showAddProductForm: () => {
        const content = document.getElementById('sellerContent');
        if (!content) return;

        content.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>
            <div class="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl">
                <form onsubmit="Seller.handleAddProduct(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input type="text" name="name" required placeholder="e.g. Kurkure Green Chutney" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" required placeholder="Describe product flavor, pack size, category..." class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none h-24"></textarea>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input type="number" name="price" required min="1" placeholder="20" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (₹)</label>
                            <input type="number" name="deliveryFee" required min="0" value="0" placeholder="0" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input type="url" name="image" required placeholder="https://..." class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                        </div>
                    </div>
                    <button type="submit" class="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition duration-150 shadow">Add Product to Inventory</button>
                </form>
            </div>
        `;

        // Update navigation UI buttons highlights
        document.getElementById('addProductBtn')?.classList.add('bg-green-600', 'text-white');
        document.getElementById('dashboardBtn')?.classList.remove('bg-green-600', 'text-white');
    },

    handleAddProduct: async (event) => {
        event.preventDefault();
        const token = Cookie.get('token');
        if (!token) {
            alert('Session expired. Please log in again.');
            window.location.href = 'login.html';
            return;
        }

        const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:5000/api';
        const formData = new FormData(event.target);

        const payload = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            deliveryFee: parseFloat(formData.get('deliveryFee') || 0),
            image: formData.get('image')
        };

        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Product added successfully to database!');
                Seller.showDashboard();
            } else {
                alert(data.message || 'Failed to add product.');
            }
        } catch (error) {
            console.error('[AddProduct] Connection Error:', error);
            alert('Failed to connect to the backend server. Please verify connections.');
        }
    },

    updateStatus: async (orderId, status) => {
        const token = Cookie.get('token');
        if (!token) return;

        const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:5000/api';

        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                Seller.showDashboard();
            } else {
                alert(data.message || 'Failed to update order status.');
            }
        } catch (error) {
            console.error('[UpdateOrderStatus] Connection Error:', error);
        }
    },

    markAllDelivered: async () => {
        const token = Cookie.get('token');
        if (!token) return;

        const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:5000/api';

        try {
            const response = await fetch(`${API_BASE_URL}/orders/seller/deliver-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                Seller.showDashboard();
            } else {
                alert(data.message || 'Failed to update orders.');
            }
        } catch (error) {
            console.error('[MarkAllDelivered] Connection Error:', error);
        }
    }
};

window.Seller = Seller;
window.showSellerDashboard = Seller.showDashboard;
window.showAddProductForm = Seller.showAddProductForm;
