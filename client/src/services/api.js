import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for error messages
export const getErrorMessage = (error, defaultMsg = 'An unexpected error occurred.') => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || defaultMsg;
};

// 1. Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// 2. Categories API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

// 3. Products API
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
};

// 4. Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (productId, quantity = 1) => api.post('/cart/items', { productId, quantity }),
  updateItem: (productId, quantity) => api.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clear: () => api.delete('/cart'),
};

// 5. Checkout API
export const checkoutAPI = {
  process: (data) => api.post('/checkout', data),
};

// 6. Orders API
export const orderAPI = {
  getMyOrders: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
};

// 7. Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  updatePassword: (data) => api.put('/profile/password', data),
};

// 8. Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (formData) =>
    api.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getProductById: (id) => api.get(`/admin/products/${id}`),
  updateProduct: (id, formData) =>
    api.put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  toggleActive: (id) => api.patch(`/admin/products/${id}/toggle-active`),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  getUsers: () => api.get('/admin/users'),
};

export default api;
