const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

/**
 * Generic helper for API fetch requests with comprehensive error parsing
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 204) {
      return null;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `HTTP error! Status: ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.fieldErrors = data?.fieldErrors || {};
      throw err;
    }

    return data;
  } catch (error) {
    if (!error.status) {
      // Network or connection error (e.g. backend server is down or CORS failed)
      const networkErr = new Error(
        `Unable to connect to backend server at ${API_BASE_URL}. Ensure the Spring Boot backend is running.`
      );
      networkErr.isNetworkError = true;
      throw networkErr;
    }
    throw error;
  }
}

export const api = {
  // Get all products (with optional search and lowStock filters)
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.lowStock) query.append('lowStock', 'true');
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${queryString}`);
  },

  // Get single product by database ID
  getProductById: (id) => request(`/products/${id}`),

  // Get product by business product ID
  getProductByProductId: (productId) => request(`/products/by-product-id/${encodeURIComponent(productId)}`),

  // Add new product
  createProduct: (productData) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    }),

  // Update existing product
  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    }),

  // Quick update of stock quantity
  updateStock: (id, quantity) =>
    request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    }),

  // Delete product
  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE'
    }),

  // Get low-stock items (< 5)
  getLowStock: () => request('/products/low-stock'),

  // Get inventory statistics
  getStats: () => request('/products/stats')
};

export default api;
