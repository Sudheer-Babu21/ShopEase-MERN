import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login?loggedOut=true');
  };

  const navItems = [
    {
      to: '/admin/dashboard',
      icon: 'bi-speedometer2',
      label: 'Performance Dashboard',
    },
    {
      to: '/admin/products',
      icon: 'bi-box-seam',
      label: 'Product Management',
    },
    {
      to: '/admin/categories',
      icon: 'bi-tags',
      label: 'Categories',
    },
    {
      to: '/admin/orders',
      icon: 'bi-truck',
      label: 'Order Fulfillment',
    },
    {
      to: '/admin/users',
      icon: 'bi-people',
      label: 'User Directory',
    },
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Admin Top Navigation */}
      <nav className="navbar navbar-dark navbar-custom sticky-top px-3">
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-dark d-lg-none border-secondary py-1 px-2"
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <Link className="navbar-brand d-flex align-items-center gap-2" to="/admin/dashboard">
              <i className="bi bi-shield-lock-fill text-warning fs-4"></i>
              <span>
                ShopEase <span className="badge bg-warning text-dark fs-6 ms-1">Admin</span>
              </span>
            </Link>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link to="/products" className="btn btn-outline-light btn-sm">
              <i className="bi bi-shop me-1"></i> Storefront
            </Link>

            <span className="text-light small d-none d-sm-inline">
              <i className="bi bi-person-circle me-1 text-info"></i>
              {user?.name}
            </span>

            <button onClick={handleLogout} className="btn btn-danger btn-sm">
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Admin Area with Sidebar */}
      <div className="container-fluid flex-grow-1">
        <div className="row flex-grow-1">
          {/* Sidebar */}
          <div
            className={`col-12 col-lg-2 admin-sidebar ${sidebarOpen ? 'd-block' : 'd-none d-lg-block'}`}
          >
            <div className="small text-uppercase text-muted fw-bold px-3 mb-2">Management</div>
            <ul className="nav flex-column mb-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                return (
                  <li className="nav-item" key={item.to}>
                    <Link
                      to={item.to}
                      className={`nav-link ${isActive ? 'active fw-bold' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <i className={`bi ${item.icon}`}></i>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="small text-uppercase text-muted fw-bold px-3 mb-2">Shortcuts</div>
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link to="/admin/products/add" className="nav-link text-info">
                  <i className="bi bi-plus-circle"></i>
                  <span>Add Product</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/products" className="nav-link text-secondary">
                  <i className="bi bi-arrow-up-right-square"></i>
                  <span>View Customer Catalog</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin Page Content */}
          <div className="col-12 col-lg-10 p-4 bg-light">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
