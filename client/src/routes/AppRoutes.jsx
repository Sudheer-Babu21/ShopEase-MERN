import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

import Layout from '../components/layout/Layout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';

// Storefront & Customer Pages
import CatalogPage from '../pages/products/CatalogPage';
import ProductDetailPage from '../pages/products/ProductDetailPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CartPage from '../pages/cart/CartPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import OrderHistoryPage from '../pages/orders/OrderHistoryPage';
import OrderDetailPage from '../pages/orders/OrderDetailPage';
import OrderConfirmationPage from '../pages/orders/OrderConfirmationPage';
import ProfilePage from '../pages/profile/ProfilePage';

// Admin Pages
import DashboardPage from '../pages/admin/DashboardPage';
import ProductListPage from '../pages/admin/ProductListPage';
import ProductFormPage from '../pages/admin/ProductFormPage';
import CategoryListPage from '../pages/admin/CategoryListPage';
import OrderListPage from '../pages/admin/OrderListPage';
import OrderDetailAdminPage from '../pages/admin/OrderDetailAdminPage';
import UserListPage from '../pages/admin/UserListPage';

const NotFoundPage = () => (
  <div className="container py-5 text-center">
    <div className="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '550px' }}>
      <i className="bi bi-compass display-1 text-primary mb-3"></i>
      <h2 className="fw-bold">404 — Page Not Found</h2>
      <p className="text-muted">The page or resource you are looking for does not exist.</p>
      <div>
        <Link to="/products" className="btn btn-primary px-4">
          <i className="bi bi-grid me-1"></i> Return to Catalog
        </Link>
      </div>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer & Storefront Routes (with Storefront Layout) */}
      <Route
        path="/"
        element={
          <Layout>
            <Navigate to="/products" replace />
          </Layout>
        }
      />
      <Route
        path="/products"
        element={
          <Layout>
            <CatalogPage />
          </Layout>
        }
      />
      <Route
        path="/products/:id"
        element={
          <Layout>
            <ProductDetailPage />
          </Layout>
        }
      />
      <Route
        path="/auth/login"
        element={
          <Layout>
            <LoginPage />
          </Layout>
        }
      />
      <Route
        path="/auth/register"
        element={
          <Layout>
            <RegisterPage />
          </Layout>
        }
      />

      {/* Protected Customer Routes */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Layout>
              <CartPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Layout>
              <CheckoutPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout>
              <OrderHistoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <OrderDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/confirmation/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <OrderConfirmationPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Protected Administrator Routes (with Admin Layout) */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminLayout>
              <DashboardPage />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminLayout>
              <ProductListPage />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/add"
        element={
          <AdminRoute>
            <AdminLayout>
              <ProductFormPage />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/edit/:id"
        element={
          <AdminRoute>
            <AdminLayout>
              <ProductFormPage />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminRoute>
            <AdminLayout>
              <CategoryListPage />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminLayout>
              <OrderListPage />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <AdminRoute>
            <AdminLayout>
              <OrderDetailAdminPage />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminLayout>
              <UserListPage />
            </AdminLayout>
          </AdminRoute>
        }
      />

      {/* 404 Catch-All */}
      <Route
        path="*"
        element={
          <Layout>
            <NotFoundPage />
          </Layout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
