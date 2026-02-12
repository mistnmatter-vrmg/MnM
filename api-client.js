// API Configuration
const API_BASE_URL = 'https://mnm-orders-api.mistnmatter.workers.dev'; // Update after deploy

// API Client
const API = {
  // Create Order
  async createOrder(orderData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return await response.json();
    } catch (error) {
      console.error('Create order error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get Orders
  async getOrders(status = null) {
    try {
      const url = status ? `${API_BASE_URL}/api/orders?status=${status}` : `${API_BASE_URL}/api/orders`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Get orders error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update Order
  async updateOrder(orderId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      return await response.json();
    } catch (error) {
      console.error('Update order error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get Stock
  async getStock() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock`);
      return await response.json();
    } catch (error) {
      console.error('Get stock error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update Stock
  async updateStock(productName, quantity) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, quantity })
      });
      return await response.json();
    } catch (error) {
      console.error('Update stock error:', error);
      return { success: false, error: error.message };
    }
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
