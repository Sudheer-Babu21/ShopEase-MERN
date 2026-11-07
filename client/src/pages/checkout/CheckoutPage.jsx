import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { checkoutAPI } from '../../services/api';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const items = cart.items || [];

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (!cart.items || cart.items.length === 0) {
      // Allow slight grace period for cart to load
      const timer = setTimeout(() => {
        if (!cart.items || cart.items.length === 0) {
          navigate('/cart');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cart, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!shippingAddress.trim() || shippingAddress.trim().length < 5) {
      setError('Please provide a complete shipping address (at least 5 characters).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await checkoutAPI.process({
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
      });

      if (res.data.success && res.data.order) {
        await refreshCart();
        navigate(`/orders/confirmation/${res.data.order._id || res.data.order.orderNumber}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to complete checkout. An inventory conflict or server error occurred.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return <LoadingSpinner message="Verifying checkout session..." />;
  }

  return (
    <>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          <i className="bi bi-shield-check me-2 text-primary"></i>Checkout &amp; Payment
        </h2>
        <p className="text-muted small mb-0">
          Provide your delivery details and choose your preferred settlement method
        </p>
      </div>

      {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}

      <div className="row g-4 mb-5">
        {/* Form Column */}
        <div className="col-12 col-lg-7">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Customer Contact Info */}
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle">1</span>
                <span>Contact Information</span>
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Customer Name</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={user?.name || ''}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Email Address</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={user?.email || ''}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle">2</span>
                <span>Shipping Address</span>
              </h5>

              <div className="mb-3">
                <label htmlFor="shippingAddress" className="form-label fw-semibold">
                  Delivery Address <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  id="shippingAddress"
                  name="shippingAddress"
                  rows="3"
                  placeholder="Enter street, apartment/suite, city, state, postal code"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  minLength="5"
                ></textarea>
                <div className="form-text small text-muted">
                  Please provide an accurate delivery destination.
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <span className="badge bg-primary rounded-circle">3</span>
                <span>Payment Method</span>
              </h5>

              <div className="d-flex flex-column gap-3 mb-2">
                {/* Cash on Delivery */}
                <div className="form-check p-3 border rounded-3 bg-light">
                  <input
                    className="form-check-input ms-0 me-3"
                    type="radio"
                    name="paymentMethod"
                    id="payCOD"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <label className="form-check-label w-100" htmlFor="payCOD" style={{ cursor: 'pointer' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-dark">
                          <i className="bi bi-cash-coin me-1 text-success"></i> Cash on Delivery (COD)
                        </div>
                        <div className="small text-muted">
                          Pay in cash or UPI when your shipment arrives at your doorstep.
                        </div>
                      </div>
                      <span className="badge bg-secondary">Zero Surcharge</span>
                    </div>
                  </label>
                </div>

                {/* Mock Payment */}
                <div className="form-check p-3 border rounded-3 bg-light">
                  <input
                    className="form-check-input ms-0 me-3"
                    type="radio"
                    name="paymentMethod"
                    id="payMOCK"
                    value="MOCK"
                    checked={paymentMethod === 'MOCK'}
                    onChange={() => setPaymentMethod('MOCK')}
                  />
                  <label className="form-check-label w-100" htmlFor="payMOCK" style={{ cursor: 'pointer' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-dark">
                          <i className="bi bi-credit-card me-1 text-primary"></i> Mock Payment (Demonstration Only)
                        </div>
                        <div className="small text-muted">
                          Simulates instant online payment authorization without real bank debit.
                        </div>
                      </div>
                      <span className="badge bg-info text-dark">Instant Simulation</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="alert alert-info small mt-3 mb-0" role="alert">
                <i className="bi bi-info-circle-fill me-1"></i>
                <strong>Payment Disclaimer:</strong> This application does not collect real credit cards or process actual financial transactions.
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 fw-bold fs-5 shadow-sm"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Allocating Inventory &amp; Placing Order...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-1"></i> Place Order ({formatCurrency(cart.totalAmount)})
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Review Summary Column */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4 sticky-top" style={{ top: '85px' }}>
            <h5 className="fw-bold mb-3">Order Items ({items.length})</h5>

            <div className="d-flex flex-column gap-3 mb-4" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {items.map((item) => {
                const prod = item.product || {};
                return (
                  <div
                    key={item.id || item._id}
                    className="d-flex justify-content-between align-items-center pb-2 border-bottom"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={getImageUrl(prod.imagePath)}
                        alt={prod.name || 'Item'}
                        className="rounded-2 border bg-white p-1"
                        style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/images/placeholder.jpg';
                        }}
                      />
                      <div>
                        <h6 className="mb-0 small fw-bold text-truncate" style={{ maxWidth: '180px' }}>
                          {prod.name}
                        </h6>
                        <span className="text-muted small">
                          Qty: {item.quantity} &times; {formatCurrency(prod.price)}
                        </span>
                      </div>
                    </div>
                    <span className="fw-bold small text-dark">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-between text-muted mb-2">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.totalAmount)}</span>
            </div>

            <div className="d-flex justify-content-between text-muted mb-3">
              <span>Shipping</span>
              <span className="text-success fw-semibold">FREE</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <span className="fw-bold fs-5">Total to Pay</span>
              <span className="display-6 fw-bold text-primary">
                {formatCurrency(cart.totalAmount)}
              </span>
            </div>

            <div className="p-3 bg-light rounded-3 small text-secondary">
              <div className="fw-bold text-dark mb-1">
                <i className="bi bi-shield-check text-success me-1"></i> Transaction Guarantee
              </div>
              An atomic database transaction guarantees your stock reservation and creates your immutable order snapshot.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
