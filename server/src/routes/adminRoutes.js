const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getDashboardMetrics } = require('../controllers/adminDashboardController');
const {
  getAdminProducts,
  createProduct,
  getProductById,
  updateProduct,
  toggleActive,
  deleteProduct,
} = require('../controllers/productController');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const {
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');
const { getUsers } = require('../controllers/adminUserController');

const router = express.Router();

// Enforce both JWT authentication and ADMIN role for all routes in this router
router.use(authenticate, authorizeAdmin);

// Dashboard metrics
router.get('/dashboard', getDashboardMetrics);

// Product management
router.get('/products', getAdminProducts);
router.post('/products', upload.single('imageFile'), createProduct);
router.get('/products/:id', getProductById);
router.put('/products/:id', upload.single('imageFile'), updateProduct);
router.patch('/products/:id/toggle-active', toggleActive);
router.delete('/products/:id', deleteProduct);

// Category management
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Order fulfillment management
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

// User account audit
router.get('/users', getUsers);

module.exports = router;
