const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = require('../app');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

describe('ShopEase Full-Stack MERN API Suite', () => {
  let adminToken = '';
  let customerToken = '';
  let customerCookie = '';
  let adminCookie = '';
  let testCategoryId = '';
  let testProductId = '';

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopease');
    }
  });

  after(async () => {
    // Clean up any test users created during test
    await User.deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.close();
  });

  // 1. Health check
  test('GET /api/v1/health returns 200 and UP status', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'UP');
  });

  // 2. Authentication: Login with valid admin credentials
  test('POST /api/v1/auth/login authenticates admin and sets httpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@shoppingcart.com', password: 'Admin@123' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.role, 'ADMIN');
    assert.ok(res.body.token);

    adminToken = res.body.token;
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Cookie must be set');
    assert.ok(cookies[0].includes('token='));
    assert.ok(cookies[0].includes('HttpOnly'));
    adminCookie = cookies[0];
  });

  // 3. Authentication: Login with valid customer credentials
  test('POST /api/v1/auth/login authenticates customer and sets httpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'john@example.com', password: 'Customer@123' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.role, 'CUSTOMER');
    assert.ok(res.body.token);

    customerToken = res.body.token;
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Cookie must be set');
    customerCookie = cookies[0];
  });

  // 4. Authentication: Invalid credentials rejection
  test('POST /api/v1/auth/login rejects invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'john@example.com', password: 'WrongPassword' });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  // 5. Authentication: Customer registration and duplicate email rejection
  test('POST /api/v1/auth/register creates customer and rejects duplicate email', async () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;

    // Successful registration
    const res1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Test Customer',
      email: uniqueEmail,
      password: 'Password123',
      confirmPassword: 'Password123',
      phone: '9988776655',
    });

    assert.strictEqual(res1.status, 201);
    assert.strictEqual(res1.body.success, true);
    assert.strictEqual(res1.body.user.role, 'CUSTOMER');

    // Duplicate email registration rejected
    const res2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Duplicate Customer',
      email: uniqueEmail,
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    assert.strictEqual(res2.status, 409);
    assert.strictEqual(res2.body.success, false);
  });

  // 6. Public Categories listing
  test('GET /api/v1/categories returns seeded categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.categories.length >= 10);
    testCategoryId = res.body.categories[0]._id;
  });

  // 7. Public Products catalog & search & filter
  test('GET /api/v1/products returns catalog with pagination and search', async () => {
    // 7a. Normal listing
    const resAll = await request(app).get('/api/v1/products?limit=10');
    assert.strictEqual(resAll.status, 200);
    assert.strictEqual(resAll.body.success, true);
    assert.ok(resAll.body.products.length > 0);
    testProductId = resAll.body.products[0]._id;

    // 7b. Keyword search
    const resSearch = await request(app).get('/api/v1/products?q=headphones');
    assert.strictEqual(resSearch.status, 200);
    assert.strictEqual(resSearch.body.success, true);
    assert.ok(resSearch.body.products.length > 0);

    // 7c. Category filter
    const resCat = await request(app).get(`/api/v1/products?category=${testCategoryId}`);
    assert.strictEqual(resCat.status, 200);
    assert.strictEqual(resCat.body.success, true);

    // 7d. Sorting price_asc
    const resSort = await request(app).get('/api/v1/products?sort=price_asc');
    assert.strictEqual(resSort.status, 200);
    if (resSort.body.products.length >= 2) {
      assert.ok(resSort.body.products[0].price <= resSort.body.products[1].price);
    }
  });

  // 8. Public Single Product details
  test('GET /api/v1/products/:id returns details or 404 for missing', async () => {
    const res = await request(app).get(`/api/v1/products/${testProductId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.product._id, testProductId.toString());

    // Non-existent id
    const resMissing = await request(app).get('/api/v1/products/60d0fe4f5311236168a109ca');
    assert.strictEqual(resMissing.status, 404);
  });

  // 9. Customer Cart: Add, Update, Retrieve, and Remove
  test('Cart lifecycle: Add, view, update quantity, and remove item', async () => {
    // 9a. Clear cart first
    await request(app)
      .delete('/api/v1/cart')
      .set('Cookie', customerCookie);

    // 9b. Add item to cart
    const resAdd = await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', customerCookie)
      .send({ productId: testProductId, quantity: 2 });

    assert.strictEqual(resAdd.status, 200);
    assert.strictEqual(resAdd.body.success, true);
    assert.strictEqual(resAdd.body.cart.lineItemCount, 1);
    assert.strictEqual(resAdd.body.cart.itemCount, 2);

    // 9c. Get cart
    const resGet = await request(app)
      .get('/api/v1/cart')
      .set('Cookie', customerCookie);

    assert.strictEqual(resGet.status, 200);
    assert.strictEqual(resGet.body.cart.lineItemCount, 1);
    assert.strictEqual(resGet.body.cart.items[0].quantity, 2);
    assert.ok(resGet.body.cart.totalAmount > 0);

    // 9d. Update quantity to 3
    const resUpdate = await request(app)
      .put(`/api/v1/cart/items/${testProductId}`)
      .set('Cookie', customerCookie)
      .send({ quantity: 3 });

    assert.strictEqual(resUpdate.status, 200);
    assert.strictEqual(resUpdate.body.cart.items[0].quantity, 3);

    // 9e. Remove item
    const resRemove = await request(app)
      .delete(`/api/v1/cart/items/${testProductId}`)
      .set('Cookie', customerCookie);

    assert.strictEqual(resRemove.status, 200);
    assert.strictEqual(resRemove.body.cart.lineItemCount, 0);
  });

  // 10. Concurrency-safe Checkout and Order Placement
  test('POST /api/v1/checkout creates order atomically and clears cart', async () => {
    // Add product to cart
    await request(app)
      .post('/api/v1/cart/items')
      .set('Cookie', customerCookie)
      .send({ productId: testProductId, quantity: 1 });

    // Checkout
    const resCheckout = await request(app)
      .post('/api/v1/checkout')
      .set('Cookie', customerCookie)
      .send({
        shippingAddress: '100 Test Suite Avenue, Tech Park, City 560001',
        paymentMethod: 'COD',
      });

    assert.strictEqual(resCheckout.status, 201);
    assert.strictEqual(resCheckout.body.success, true);
    assert.ok(resCheckout.body.order);
    assert.strictEqual(resCheckout.body.order.status, 'PLACED');
    assert.strictEqual(resCheckout.body.order.paymentMethod, 'COD');

    // Verify cart is now empty
    const resCart = await request(app)
      .get('/api/v1/cart')
      .set('Cookie', customerCookie);
    assert.strictEqual(resCart.body.cart.lineItemCount, 0);
  });

  // 11. Customer Orders & Authorization Restriction
  test('Order history and access control: customer cannot view another user order', async () => {
    // 11a. Customer gets their own orders
    const resMyOrders = await request(app)
      .get('/api/v1/orders')
      .set('Cookie', customerCookie);

    assert.strictEqual(resMyOrders.status, 200);
    assert.ok(resMyOrders.body.orders.length > 0);
    const myOrderId = resMyOrders.body.orders[0]._id;

    // 11b. Customer gets detail of their own order
    const resDetail = await request(app)
      .get(`/api/v1/orders/${myOrderId}`)
      .set('Cookie', customerCookie);

    assert.strictEqual(resDetail.status, 200);
    assert.strictEqual(resDetail.body.order._id, myOrderId.toString());

    // 11c. Customer attempts to view Jane's order (#1003)
    const janeOrder = await Order.findOne({ orderNumber: 1003 });
    if (janeOrder) {
      const resForbidden = await request(app)
        .get(`/api/v1/orders/${janeOrder._id}`)
        .set('Cookie', customerCookie);

      assert.strictEqual(resForbidden.status, 403);
      assert.strictEqual(resForbidden.body.success, false);
    }
  });

  // 12. Customer Profile update and password change
  test('Profile operations: update name/phone and change password', async () => {
    // 12a. Update profile
    const resProfile = await request(app)
      .put('/api/v1/profile')
      .set('Cookie', customerCookie)
      .send({ name: 'John Updated Customer', phone: '9988776655' });

    assert.strictEqual(resProfile.status, 200);
    assert.strictEqual(resProfile.body.profile.name, 'John Updated Customer');

    // 12b. Update password
    const resPass = await request(app)
      .put('/api/v1/profile/password')
      .set('Cookie', customerCookie)
      .send({
        currentPassword: 'Customer@123',
        newPassword: 'Customer@456',
        confirmPassword: 'Customer@456',
      });

    assert.strictEqual(resPass.status, 200);

    // Revert password back for test repeatability
    await request(app)
      .put('/api/v1/profile/password')
      .set('Cookie', customerCookie)
      .send({
        currentPassword: 'Customer@456',
        newPassword: 'Customer@123',
        confirmPassword: 'Customer@123',
      });
  });

  // 13. Admin Authorization Protection
  test('Admin routes reject customer access with 403', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Cookie', customerCookie);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  // 14. Admin Dashboard Metrics
  test('Admin: GET /api/v1/admin/dashboard returns live metrics and low stock', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Cookie', adminCookie);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.metrics);
    assert.ok(typeof res.body.metrics.netRevenue === 'number');
    assert.ok(typeof res.body.metrics.totalOrders === 'number');
    assert.ok(Array.isArray(res.body.recentOrders));
  });

  // 15. Admin Category Management with Referential Integrity Protection
  test('Admin Category CRUD & referential integrity protection', async () => {
    // 15a. Create Category
    const resCreate = await request(app)
      .post('/api/v1/admin/categories')
      .set('Cookie', adminCookie)
      .send({ name: 'Test Temp Category', description: 'Temporary test description' });

    assert.strictEqual(resCreate.status, 201);
    const newCatId = resCreate.body.category._id;

    // 15b. Update Category
    const resUpdate = await request(app)
      .put(`/api/v1/admin/categories/${newCatId}`)
      .set('Cookie', adminCookie)
      .send({ name: 'Updated Temp Category', description: 'Updated description' });

    assert.strictEqual(resUpdate.status, 200);
    assert.strictEqual(resUpdate.body.category.name, 'Updated Temp Category');

    // 15c. Delete Category (No products attached -> succeeds)
    const resDelete = await request(app)
      .delete(`/api/v1/admin/categories/${newCatId}`)
      .set('Cookie', adminCookie);

    assert.strictEqual(resDelete.status, 200);

    // 15d. Attempt to delete seeded category with products attached -> rejected with 400
    const resDeleteSeeded = await request(app)
      .delete(`/api/v1/admin/categories/${testCategoryId}`)
      .set('Cookie', adminCookie);

    assert.strictEqual(resDeleteSeeded.status, 400);
    assert.strictEqual(resDeleteSeeded.body.success, false);
  });

  // 16. Admin Order State Machine & Stock Replenishment on Cancellation
  test('Admin Order state machine transitions and stock restoration on cancellation', async () => {
    // 16a. Find an order in PLACED state
    const placedOrder = await Order.findOne({ status: 'PLACED' });
    assert.ok(placedOrder, 'Need a placed order to test transitions');

    // 16b. PLACED -> PACKED
    const resPacked = await request(app)
      .patch(`/api/v1/admin/orders/${placedOrder._id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'PACKED' });

    assert.strictEqual(resPacked.status, 200);
    assert.strictEqual(resPacked.body.order.status, 'PACKED');

    // 16c. PACKED -> SHIPPED
    const resShipped = await request(app)
      .patch(`/api/v1/admin/orders/${placedOrder._id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'SHIPPED' });

    assert.strictEqual(resShipped.status, 200);
    assert.strictEqual(resShipped.body.order.status, 'SHIPPED');

    // 16d. Illegal transition SHIPPED -> PLACED rejected
    const resIllegal = await request(app)
      .patch(`/api/v1/admin/orders/${placedOrder._id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'PLACED' });

    assert.strictEqual(resIllegal.status, 400);

    // 16e. SHIPPED -> CANCELLED restores stock
    const itemToRestock = placedOrder.items[0];
    let prevStock = 0;
    if (itemToRestock && itemToRestock.product) {
      const p = await Product.findById(itemToRestock.product);
      if (p) prevStock = p.stockQty;
    }

    const resCancel = await request(app)
      .patch(`/api/v1/admin/orders/${placedOrder._id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'CANCELLED' });

    assert.strictEqual(resCancel.status, 200);
    assert.strictEqual(resCancel.body.order.status, 'CANCELLED');

    if (itemToRestock && itemToRestock.product) {
      const afterP = await Product.findById(itemToRestock.product);
      assert.strictEqual(afterP.stockQty, prevStock + itemToRestock.quantity);
    }
  });

  // 17. Admin User Audit Directory (omits password hashes)
  test('Admin: GET /api/v1/admin/users lists accounts without exposing passwords', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Cookie', adminCookie);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.users.length >= 3);
    for (const u of res.body.users) {
      assert.strictEqual(u.passwordHash, undefined, 'Password hash must never be returned');
      assert.ok(u.email);
      assert.ok(u.role);
    }
  });
});
