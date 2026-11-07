import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-custom">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <h5 className="text-white fw-bold d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-bag-check-fill text-info"></i> ShopEase
            </h5>
            <p className="small text-secondary">
              Your full-featured modern online shopping platform built with MongoDB, Express.js,
              React.js, Node.js, and responsive Bootstrap 5.
            </p>
            <div className="text-secondary small">
              <i className="bi bi-shield-check text-success me-1"></i> BCrypt Secured &bull;
              Concurrency Protected &bull; MERN Architecture
            </div>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="text-white fw-semibold mb-3">Storefront</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <Link to="/products">All Products</Link>
              </li>
              <li className="mb-2">
                <Link to="/cart">Shopping Cart</Link>
              </li>
              <li className="mb-2">
                <Link to="/orders">Order History</Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="text-white fw-semibold mb-3">Account</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <Link to="/auth/login">Customer Sign In</Link>
              </li>
              <li className="mb-2">
                <Link to="/auth/register">Create Account</Link>
              </li>
              <li className="mb-2">
                <Link to="/profile">My Profile</Link>
              </li>
            </ul>
          </div>

          <div className="col-12 col-md-4">
            <h6 className="text-white fw-semibold mb-3">Technology Stack</h6>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-secondary">MongoDB 9.0</span>
              <span className="badge bg-secondary">Express.js 4</span>
              <span className="badge bg-secondary">React 18</span>
              <span className="badge bg-secondary">Node.js 24</span>
              <span className="badge bg-secondary">Mongoose 8</span>
              <span className="badge bg-secondary">Bootstrap 5.3.3</span>
            </div>
            <div className="mt-3 small text-secondary">
              Production-grade e-commerce application demonstrating modern full-stack JavaScript.
            </div>
          </div>
        </div>

        <div className="border-top border-secondary pt-3 text-center small text-secondary">
          &copy; {new Date().getFullYear()} ShopEase — Online Shopping Cart System. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
