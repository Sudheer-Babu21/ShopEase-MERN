import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navCollapse, setNavCollapse] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login?loggedOut=true');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/products">
          <i className="bi bi-bag-check-fill text-info fs-3"></i>
          <span>
            Shop<span className="brand-gradient">Ease</span>
          </span>
        </Link>

        {/* Mobile toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setNavCollapse(!navCollapse)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${navCollapse ? 'show' : ''}`} id="navbarMain">
          {/* Search bar */}
          <form
            className="d-flex my-2 my-lg-0 mx-auto col-12 col-lg-5"
            onSubmit={handleSearchSubmit}
          >
            <div className="input-group">
              <input
                className="form-control bg-dark text-white border-secondary"
                type="search"
                name="q"
                placeholder="Search laptop, headphones, shirts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-primary" type="submit" title="Search catalog">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          {/* Navigation links */}
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
                to="/products"
              >
                <i className="bi bi-grid me-1"></i> Catalog
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link position-relative" to="/cart" title="Shopping Cart">
                    <i className="bi bi-cart3 fs-5"></i>
                    <span className="badge rounded-pill bg-danger badge-cart">{cartCount}</span>
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname.startsWith('/orders') ? 'active' : ''}`}
                    to="/orders"
                  >
                    <i className="bi bi-receipt me-1"></i> My Orders
                  </Link>
                </li>

                {isAdmin && (
                  <li className="nav-item">
                    <Link
                      className="nav-link text-warning fw-semibold"
                      to="/admin/dashboard"
                      title="Open Administrator Console"
                    >
                      <i className="bi bi-shield-lock-fill me-1"></i> Admin
                    </Link>
                  </li>
                )}

                {/* User Dropdown */}
                <li className="nav-item dropdown position-relative">
                  <button
                    className="nav-link dropdown-toggle d-flex align-items-center gap-1 btn btn-link text-decoration-none border-0"
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <i className="bi bi-person-circle fs-5"></i>
                    <span>{user?.name}</span>
                  </button>

                  {dropdownOpen && (
                    <ul
                      className="dropdown-menu dropdown-menu-end shadow show position-absolute end-0"
                      style={{ minWidth: '220px', zIndex: 1050 }}
                    >
                      <li>
                        <h6 className="dropdown-header text-truncate">{user?.email}</h6>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-person me-2"></i>My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/orders"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-box-seam me-2"></i>Order History
                        </Link>
                      </li>
                      {isAdmin && (
                        <li>
                          <Link
                            className="dropdown-item text-warning fw-semibold"
                            to="/admin/dashboard"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <i className="bi bi-speedometer2 me-2"></i>Admin Dashboard
                          </Link>
                        </li>
                      )}
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li className="px-3 py-1">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm w-100"
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                        >
                          <i className="bi bi-box-arrow-right me-1"></i> Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/auth/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-sm px-3" to="/auth/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
