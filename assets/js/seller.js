/**
 * Seller Panel Logic
 */

const Seller = {
    showDashboard: () => {
        const content = document.getElementById('sellerContent');
        if (!content) return;

        const sellerProducts = Storage.get('sellerProducts', []);
        const orders = Storage.get('orders', []);
        
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalItemsSold = orders.reduce((sum, order) => sum + order.items.length, 0);

        content.innerHTML = `
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Seller Dashboard</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <p class="text-sm text-gray-600">Total Products</p>
                        <p class="text-2xl font-bold text-green-600">${sellerProducts.length}</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <p class="text-sm text-gray-600">Total Revenue</p>
                        <p class="text-2xl font-bold text-green-600">₹${totalRevenue}</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <p class="text-sm text-gray-600">Items Sold</p>
                        <p class="text-2xl font-bold text-green-600">${totalItemsSold}</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="font-bold text-gray-800">Recent Orders</h3>
                    <button onclick="Seller.markAllDelivered()" class="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Mark All Delivered</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th class="p-4">ID</th>
                                <th class="p-4">Items</th>
                                <th class="p-4">Total</th>
                                <th class="p-4">Status</th>
                                <th class="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${orders.slice(-10).reverse().map(order => `
                                <tr class="text-sm">
                                    <td class="p-4">#${order.id.toString().slice(-6)}</td>
                                    <td class="p-4">${order.items.length} items</td>
                                    <td class="p-4 font-bold">₹${order.total}</td>
                                    <td class="p-4">
                                        <span class="px-2 py-1 rounded-full text-xs ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                                            ${order.status}
                                        </span>
                                    </td>
                                    <td class="p-4">
                                        ${order.status === 'pending' ? `<button onclick="Seller.updateStatus(${order.id}, 'delivered')" class="text-green-600 hover:underline">Mark Delivered</button>` : '-'}
                                    </td>
                                </tr>
                            `).join('')}
                            ${orders.length === 0 ? '<tr><td colspan="5" class="p-8 text-center text-gray-500">No orders yet</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Update nav buttons
        document.getElementById('dashboardBtn')?.classList.add('bg-green-600', 'text-white');
        document.getElementById('addProductBtn')?.classList.remove('bg-green-600', 'text-white');
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
                        <input type="text" name="name" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input type="number" name="price" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input type="url" name="image" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                        </div>
                    </div>
                    <button type="submit" class="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">Add Product</button>
                </form>
            </div>
        `;

        // Update nav buttons
        document.getElementById('addProductBtn')?.classList.add('bg-green-600', 'text-white');
        document.getElementById('dashboardBtn')?.classList.remove('bg-green-600', 'text-white');
    },

    handleAddProduct: (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const newProduct = {
            id: Date.now(),
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            image: formData.get('image'),
            category: 'seller'
        };

        const products = Storage.get('sellerProducts', []);
        products.push(newProduct);
        Storage.set('sellerProducts', products);
        
        alert('Product added!');
        Seller.showDashboard();
    },

    updateStatus: (orderId, status) => {
        const orders = Storage.get('orders', []);
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
            orders[idx].status = status;
            Storage.set('orders', orders);
            Seller.showDashboard();
        }
    },

    markAllDelivered: () => {
        const orders = Storage.get('orders', []);
        orders.forEach(o => o.status = 'delivered');
        Storage.set('orders', orders);
        Seller.showDashboard();
    }
};

window.Seller = Seller;
window.showSellerDashboard = Seller.showDashboard;
window.showAddProductForm = Seller.showAddProductForm;
