import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { formatCurrency, formatDate, getImageUrl } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getMyOrders();
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load order history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your past orders..." />;
  }

  return (
    <div className="row g-4 mb-5">
      <div className="col-12">
        <h2 className="fw-bold mb-1">
          <i className="bi bi-receipt me-2 text-primary"></i>My Order History
        </h2>
        <p className="text-muted small">
          Track your past purchases, shipment statuses, and view itemized invoices
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="col-12">
          <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-4">
            <i className="bi bi-inbox display-1 text-muted mb-3 d-inline-block"></i>
            <h4 className="fw-bold text-dark">No Orders Placed Yet</h4>
            <p className="text-muted small mb-4">You have not completed any purchases yet.</p>
            <Link to="/products" className="btn btn-primary px-4 py-2">
              <i className="bi bi-grid me-1"></i> Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="col-12">
          <div className="d-flex flex-column gap-4">
            {orders.map((o) => {
              const orderId = o.orderNumber || o._id;
              return (
                <div className="card border-0 shadow-sm overflow-hidden" key={o._id}>
                  <div className="card-header bg-white p-3 p-md-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                      <span className={`badge badge-status badge-status-${o.status} me-2`}>
                        {o.status}
                      </span>
                      <span className="fw-bold text-dark fs-6">Order #{orderId}</span>
                      <span className="text-muted small ms-2">&bull; Placed on {formatDate(o.orderDate)}</span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-bold text-primary fs-5">{formatCurrency(o.totalAmount)}</span>
                      <Link to={`/orders/${o._id || orderId}`} className="btn btn-outline-primary btn-sm px-3">
                        <i className="bi bi-eye me-1"></i> Details
                      </Link>
                    </div>
                  </div>

                  <div className="card-body p-3 p-md-4">
                    <div className="row g-3 align-items-center">
                      <div className="col-12 col-md-8">
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                          {o.items?.map((item, idx) => (
                            <div
                              key={item._id || idx}
                              className="d-flex align-items-center gap-2 bg-light p-2 rounded-2 border"
                            >
                              <img
                                src={getImageUrl(item.productImage)}
                                alt={item.productName}
                                className="rounded border bg-white p-1"
                                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/assets/images/placeholder.jpg';
                                }}
                              />
                              <span className="small fw-semibold text-truncate" style={{ maxWidth: '140px' }}>
                                {item.productName}
                              </span>
                              <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                                &times;{item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="col-12 col-md-4 text-md-end small text-muted">
                        <div>
                          Payment: <strong>{o.paymentMethod}</strong>
                        </div>
                        <div className="text-truncate" style={{ maxWidth: '300px', display: 'inline-block' }}>
                          Ship To: {o.shippingAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
