import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verifying administrator credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <div className="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '600px' }}>
          <i className="bi bi-shield-x display-1 text-danger mb-3"></i>
          <h2 className="fw-bold">403 — Access Denied</h2>
          <p className="text-muted">
            You do not possess the required administrator authorization privileges to view this management console.
          </p>
          <div>
            <a href="/products" className="btn btn-primary px-4">
              Return to Customer Catalog
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
