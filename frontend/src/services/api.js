// API service for communicating with the backend
const API_BASE_URL = "http://localhost:3001/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Refresh token from localStorage on each request
    this.token = localStorage.getItem("token");

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    console.log(`🔄 Making API request to: ${url}`);
    console.log(`📋 Request config:`, config);

    try {
      const response = await fetch(url, config);

      console.log(
        `📡 Response status: ${response.status} ${response.statusText}`
      );

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error(`❌ API Error Response:`, errorData);
        } catch {
          // If JSON parsing fails, use the HTTP status message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ API Success Response:`, data);
      return data;
    } catch (error) {
      // Handle different types of errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.error("❌ Network Error: Cannot connect to backend server");
        throw new Error(
          "Cannot connect to server. Please make sure the backend is running on port 3001."
        );
      }

      console.error("❌ API request failed:", error);
      throw error;
    }
  }

  // Test backend connection
  async testConnection() {
    try {
      const response = await this.request("/health");
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Authentication methods
  async login(email, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      this.token = data.token;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  }

  async register(name, email, password) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (data.token) {
      this.token = data.token;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  // Product methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";
    return this.request(endpoint);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async getFeaturedProducts() {
    return this.request("/products/featured");
  }

  // Category methods
  async getCategories() {
    return this.request("/categories");
  }

  async getCategory(id) {
    return this.request(`/categories/${id}`);
  }

  // Cart methods
  async getCart() {
    return this.request("/cart");
  }

  async addToCart(productId, quantity = 1, color = null, size = null) {
    return this.request("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, color, size }),
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId) {
    return this.request(`/cart/${itemId}`, {
      method: "DELETE",
    });
  }

  async clearCart() {
    return this.request("/cart", {
      method: "DELETE",
    });
  }

  // Favorites methods
  async getFavorites() {
    return this.request("/users/favorites");
  }

  async addToFavorites(productId) {
    return this.request(`/users/favorites/${productId}`, {
      method: "POST",
    });
  }

  async removeFromFavorites(productId) {
    return this.request(`/users/favorites/${productId}`, {
      method: "DELETE",
    });
  }

  // Order methods
  async getOrders() {
    return this.request("/orders");
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  // Payment methods
  async processPayment(paymentData) {
    return this.request("/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentDetails(paymentId) {
    return this.request(`/payments/${paymentId}`);
  }

  async getUserPayments() {
    return this.request("/payments");
  }

  // Health check
  async healthCheck() {
    return this.request("/health");
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for convenience
export const {
  login,
  register,
  logout,
  getCurrentUser,
  getProducts,
  getProduct,
  getFeaturedProducts,
  getCategories,
  getCategory,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getOrders,
  getOrder,
  createOrder,
  processPayment,
  getPaymentDetails,
  getUserPayments,
  healthCheck,
} = apiService;
