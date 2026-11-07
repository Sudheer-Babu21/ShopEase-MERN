import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getById(id);
        if (res.data.success && res.data.product) {
          setProduct(res.data.product);
        }
      } catch (err) {
        setAlert({ type: 'danger', message: 'Product not found or failed to load.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=${encodeURIComponent(`/products/${id}`)}`);
      return;
    }

    try {
      setAdding(true);
      await addToCart(product._id || product.id, quantity);
      setAlert({
        type: 'success',
        message: `Successfully added ${quantity} unit(s) of '${product.name}' to your cart!`,
      });
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to add item to cart.',
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="card border-0 shadow-sm p-5 text-center my-4">
        <i className="bi bi-exclamation-triangle display-3 text-warning mb-3"></i>
        <h4 className="fw-bold">Product Not Found</h4>
        <p className="text-muted">The requested catalog item could not be retrieved.</p>
        <div>
          <Link to="/products" className="btn btn-primary px-4">
            <i className="bi bi-arrow-left me-1"></i> Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = product.category?.name || 'General';
  const stock = product.stockQty || 0;

  return (
    <>
      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/products" className="text-decoration-none">
              Catalog
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link
              to={`/products?category=${product.category?._id || product.category?.categoryId || ''}`}
              className="text-decoration-none"
            >
              {categoryName}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Product Detail Card */}
      <div className="card border-0 shadow-sm p-4 p-md-5 mb-5">
        <div className="row g-4 align-items-center">
          {/* Product Image */}
          <div className="col-12 col-md-5 text-center">
            <div className="rounded-4 overflow-hidden shadow-sm border bg-light p-3">
              <img
                src={getImageUrl(product.imagePath)}
                alt={product.name}
                className="img-fluid rounded-3"
                style={{ maxHeight: '380px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/placeholder.jpg';
                }}
              />
            </div>
          </div>

          {/* Product Info & Actions */}
          <div className="col-12 col-md-7">
            <span className="badge bg-primary text-uppercase px-3 py-2 mb-2">
              {categoryName}
            </span>

            <h1 className="h2 fw-bold text-dark mb-2">{product.name}</h1>

            <div className="d-flex align-items-baseline gap-3 mb-3">
              <span className="display-6 fw-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              {stock > 0 ? (
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                  <i className="bi bi-check2-circle me-1"></i> In Stock ({stock} available)
                </span>
              ) : (
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2">
                  <i className="bi bi-x-circle me-1"></i> Out of Stock
                </span>
              )}
            </div>

            <hr className="my-4" />

            <h6 className="fw-bold text-uppercase text-muted small mb-2">Product Description</h6>
            <p className="text-secondary leading-relaxed mb-4">
              {product.description || 'No detailed description available for this item.'}
            </p>

            {stock > 0 ? (
              isAuthenticated ? (
                <form onSubmit={handleAddToCart} className="row g-3 align-items-end mb-4">
                  <div className="col-auto">
                    <label htmlFor="quantityInput" className="form-label fw-semibold small text-muted">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantityInput"
                      name="quantity"
                      className="form-control"
                      value={quantity}
                      min="1"
                      max={stock}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(stock, parseInt(e.target.value, 10) || 1)))}
                      style={{ width: '100px' }}
                    />
                  </div>

                  <div className="col-auto">
                    <button
                      type="submit"
                      className="btn btn-primary px-4 py-2 shadow-sm"
                      disabled={adding}
                    >
                      {adding ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cart-plus me-1"></i> Add to Shopping Cart
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 bg-light rounded-3 border mb-4">
                  <p className="small text-muted mb-2">
                    Please sign in to add this item to your cart and proceed to checkout.
                  </p>
                  <Link
                    to={`/auth/login?redirect=${encodeURIComponent(`/products/${id}`)}`}
                    className="btn btn-primary btn-sm px-4"
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i> Sign In to Buy
                  </Link>
                </div>
              )
            ) : (
              <div className="alert alert-warning mb-4">
                <i className="bi bi-clock-history me-1"></i> This item is currently sold out. Please check back later.
              </div>
            )}

            {/* Security Highlights */}
            <div className="p-3 bg-light rounded-3 border small text-muted">
              <div className="d-flex align-items-center gap-3">
                <div>
                  <i className="bi bi-shield-check text-success fs-4"></i>
                </div>
                <div>
                  <div className="fw-bold text-dark">Enterprise Reliability Guarantee</div>
                  <div>Live database inventory verification with atomic stock locks on order checkout.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
