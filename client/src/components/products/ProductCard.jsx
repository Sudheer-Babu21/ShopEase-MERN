import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, getCategoryIcon, getImageUrl } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, onAddSuccess }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const price = product.price || 0;
  const mrp = Math.round(price * 1.2 * 100) / 100; // 20% discount representation
  const stock = product.stockQty || 0;
  const categoryName = product.category?.name || 'General';
  const ratingSeed = (product.name?.length || 5) % 5;
  const reviewCount = 20 + ((product.name?.length || 5) * 7) % 80;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    try {
      setAdding(true);
      await addToCart(product._id || product.id, 1);
      setAdded(true);
      if (onAddSuccess) onAddSuccess(`Added '${product.name}' to your cart!`);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card">
      {/* Product Image and Badges */}
      <div className="product-image-container">
        <Link to={`/products/${product._id || product.id}`} className="d-flex align-items-center justify-content-center w-100 h-100">
          <img
            src={getImageUrl(product.imagePath)}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/images/placeholder.jpg';
            }}
          />
        </Link>

        {stock === 0 ? (
          <span className="position-absolute top-0 end-0 m-2 badge bg-danger shadow-sm">
            <i className="bi bi-x-circle me-1"></i>Sold Out
          </span>
        ) : stock <= 5 ? (
          <span className="position-absolute top-0 end-0 m-2 badge bg-warning text-dark shadow-sm">
            <i className="bi bi-lightning-fill me-1"></i>Only {stock} Left!
          </span>
        ) : null}
      </div>

      <div className="card-body">
        {/* Category Badge */}
        <span
          className="badge bg-light text-primary border text-uppercase mb-2 align-self-start"
          style={{ fontSize: '0.7rem', fontWeight: 600 }}
        >
          <i className={`bi ${getCategoryIcon(categoryName)} me-1`}></i>
          {categoryName}
        </span>

        {/* Product Title */}
        <h6 className="card-title fw-bold mb-1">
          <Link
            to={`/products/${product._id || product.id}`}
            className="text-dark text-decoration-none product-title-link"
          >
            {product.name}
          </Link>
        </h6>

        {/* Rating Stars */}
        <div className="d-flex align-items-center gap-1 mb-2 text-warning" style={{ fontSize: '0.75rem' }}>
          <i className="bi bi-star-fill"></i>
          <i className="bi bi-star-fill"></i>
          <i className="bi bi-star-fill"></i>
          <i className="bi bi-star-fill"></i>
          <i className="bi bi-star-half"></i>
          <span className="text-muted ms-1">
            4.{ratingSeed + 4} ({reviewCount})
          </span>
        </div>

        {/* Product Short Description */}
        <p className="card-text text-muted small flex-grow-1 mb-3 product-desc-clamp">
          {product.description || ''}
        </p>

        {/* Price and Stock Indicator */}
        <div className="d-flex flex-wrap align-items-baseline gap-2 mb-2">
          <span className="product-price fs-5 fw-bold">{formatCurrency(price)}</span>
          <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.85rem' }}>
            {formatCurrency(mrp)}
          </span>
          <span
            className="badge bg-success-subtle text-success border border-success-subtle px-1 py-0"
            style={{ fontSize: '0.65rem', fontWeight: 700 }}
          >
            20% OFF
          </span>
        </div>

        <div className="d-flex align-items-center justify-content-between mb-3">
          {stock > 5 ? (
            <small className="text-success fw-semibold">
              <i className="bi bi-check-circle-fill me-1"></i>In Stock
            </small>
          ) : stock > 0 ? (
            <small className="text-warning-emphasis fw-semibold">
              <i className="bi bi-exclamation-triangle-fill me-1"></i>Low Stock ({stock} left)
            </small>
          ) : (
            <small className="text-danger fw-semibold">
              <i className="bi bi-x-circle-fill me-1"></i>Temporarily Sold Out
            </small>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex align-items-center gap-2 mt-auto pt-2 border-top">
          <Link
            to={`/products/${product._id || product.id}`}
            className="btn btn-outline-secondary btn-sm px-2 flex-grow-1"
            title="View Full Details"
          >
            <i className="bi bi-eye"></i> Details
          </Link>

          {stock > 0 ? (
            <button
              type="button"
              className={`btn btn-sm flex-grow-1 px-2 ${added ? 'btn-success' : 'btn-primary'}`}
              title="Add to Cart"
              onClick={handleAddToCart}
              disabled={adding}
            >
              {adding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Adding...
                </>
              ) : added ? (
                <>
                  <i className="bi bi-check-lg me-1"></i> Added
                </>
              ) : (
                <>
                  <i className="bi bi-cart-plus me-1"></i> Add
                </>
              )}
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm flex-grow-1 px-2" disabled title="Product is out of stock">
              <i className="bi bi-dash-circle me-1"></i> Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
