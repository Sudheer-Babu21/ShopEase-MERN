import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [quantities, setQuantities] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const items = cart.items || [];

  const handleQtyInputChange = (productId, val) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: val,
    }));
  };

  const handleUpdate = async (productId, currentQty, maxStock) => {
    const val = quantities[productId] !== undefined ? parseInt(quantities[productId], 10) : currentQty;
    if (isNaN(val) || val <= 0) {
      setAlert({ type: 'danger', message: 'Quantity must be at least 1.' });
      return;
    }

    if (maxStock && val > maxStock) {
      setAlert({
        type: 'danger',
        message: `Only ${maxStock} unit(s) available in stock for this product.`,
      });
      return;
    }

    try {
      setUpdatingId(productId);
      await updateQuantity(productId, val);
      setAlert({ type: 'success', message: 'Cart quantity updated.' });
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update quantity.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    if (!window.confirm('Remove this item from your cart?')) return;

    try {
      await removeFromCart(productId);
      setAlert({ type: 'info', message: 'Item removed from your cart.' });
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to remove item.',
      });
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all items from your shopping cart?')) return;
    try {
      await clearCart();
      setAlert({ type: 'info', message: 'Your shopping cart has been emptied.' });
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to clear cart.',
      });
    }
  };

  if (loading && items.length === 0) {
    return <LoadingSpinner message="Loading your shopping cart..." />;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-cart3 me-2 text-primary"></i>Your Shopping Cart
          </h2>
          <p className="text-muted small mb-0">
            Review your selected items, update quantities, and proceed to checkout
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={handleClearAll}
          >
            <i className="bi bi-trash3 me-1"></i> Clear Cart
          </button>
        )}
      </div>

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {items.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-4 my-4">
          <i className="bi bi-cart-x display-1 text-muted mb-3 d-inline-block"></i>
          <h4 className="fw-bold text-dark">Your Shopping Cart is Empty</h4>
          <p className="text-muted small mb-4">
            You haven't added any items to your shopping cart yet. Browse our live catalog to get started.
          </p>
          <Link to="/products" className="btn btn-primary px-4 py-2">
            <i className="bi bi-grid me-1"></i> Explore Products
          </Link>
        </div>
      ) : (
        <div className="row g-4 mb-5">
          {/* Cart Table Column */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm overflow-hidden mb-4">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 cart-table">
                  <thead>
                    <tr>
                      <th scope="col" className="ps-4 py-3">Product</th>
                      <th scope="col">Price</th>
                      <th scope="col" style={{ width: '130px' }}>Quantity</th>
                      <th scope="col">Subtotal</th>
                      <th scope="col" className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const prod = item.product || {};
                      const prodId = prod._id || prod.id;
                      const currentVal =
                        quantities[prodId] !== undefined ? quantities[prodId] : item.quantity;
                      const isLowStock = prod.stockQty < item.quantity;
                      const isUpdating = updatingId === prodId;

                      return (
                        <tr key={item.id || item._id || prodId}>
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={getImageUrl(prod.imagePath)}
                                alt={prod.name || 'Item'}
                                className="rounded-3 border bg-white p-1"
                                style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/assets/images/placeholder.jpg';
                                }}
                              />
                              <div>
                                <h6 className="mb-1 fw-bold">
                                  <Link
                                    to={`/products/${prodId}`}
                                    className="text-dark text-decoration-none"
                                  >
                                    {prod.name}
                                  </Link>
                                </h6>
                                <span className="text-muted small">
                                  {prod.category?.name || ''}
                                </span>
                                {isLowStock && (
                                  <div className="badge bg-warning text-dark mt-1 d-block" style={{ width: 'fit-content' }}>
                                    Only {prod.stockQty} left in stock
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="fw-semibold text-secondary">
                              {formatCurrency(prod.price)}
                            </span>
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <input
                                type="number"
                                className="form-control form-control-sm text-center"
                                value={currentVal}
                                min="1"
                                max={prod.stockQty || 10}
                                onChange={(e) => handleQtyInputChange(prodId, e.target.value)}
                                style={{ width: '65px' }}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                title="Update Quantity"
                                onClick={() => handleUpdate(prodId, item.quantity, prod.stockQty)}
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                  <i className="bi bi-arrow-repeat"></i>
                                )}
                              </button>
                            </div>
                          </td>

                          <td>
                            <span className="fw-bold text-primary">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </td>

                          <td className="text-end pe-4">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm border-0"
                              title="Remove item"
                              onClick={() => handleRemove(prodId)}
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="card-footer bg-white p-3 d-flex justify-content-between align-items-center">
                <Link to="/products" className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-arrow-left me-1"></i> Continue Shopping
                </Link>
                <span className="text-muted small">
                  Prices verified against live MongoDB database catalog
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary Side Card */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm p-4">
              <h5 className="fw-bold mb-3">Order Summary</h5>

              <div className="d-flex justify-content-between text-muted mb-2">
                <span>Items Subtotal</span>
                <span>{formatCurrency(cart.totalAmount)}</span>
              </div>

              <div className="d-flex justify-content-between text-muted mb-2">
                <span>Estimated Shipping</span>
                <span className="text-success fw-semibold">FREE</span>
              </div>

              <div className="d-flex justify-content-between text-muted mb-3">
                <span>Tax (Included)</span>
                <span>{formatCurrency(0)}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <span className="fw-bold fs-5">Estimated Total</span>
                <span className="display-6 fw-bold text-primary">
                  {formatCurrency(cart.totalAmount)}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-primary w-100 py-3 fw-bold shadow-sm mb-3"
                onClick={() => navigate('/checkout')}
              >
                <i className="bi bi-lock-fill me-1"></i> Proceed to Checkout
              </button>

              <div className="p-3 bg-light rounded-3 small text-secondary">
                <div className="fw-semibold text-dark mb-1">
                  <i className="bi bi-shield-check text-success me-1"></i> Purchase Protection
                </div>
                Your purchase is protected with concurrency-safe inventory allocation upon order placement.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartPage;
