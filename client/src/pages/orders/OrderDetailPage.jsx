import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { formatCurrency, formatDate, getImageUrl } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getById(id);
        if (res.data.success && res.data.order) {
          setOrder(res.data.order);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading order invoice details..." />;
  }

  if (error || !order) {
    return (
      <div className="card border-0 shadow-sm p-5 text-center my-4">
        <i className="bi bi-shield-x display-3 text-danger mb-3"></i>
        <h4 className="fw-bold">Unable to Load Order</h4>
        <p className="text-muted">{error || 'Order record not found.'}</p>
        <div>
          <Link to="/orders" className="btn btn-primary px-4">
            <i className="bi bi-arrow-left me-1"></i> Return to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderNum = order.orderNumber || order._id;

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/products" className="text-decoration-none">
              Store
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/orders" className="text-decoration-none">
              My Orders
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Order #{orderNum}
          </li>
        </ol>
      </nav>

      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-4 gap-2">
              <div>
                <span className={`badge badge-status badge-status-${order.status} me-2`}>
                  {order.status}
                </span>
                <h4 className="fw-bold text-dark d-inline">Order #{orderNum}</h4>
              </div>
              <div className="text-muted small">
                Placed on <strong className="text-dark">{formatDate(order.orderDate)}</strong>
              </div>
            </div>

            <h5 className="fw-bold mb-3">Order Items</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th className="text-center">Quantity</th>
                    <th>Historical Price</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={item._id || idx}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={getImageUrl(item.productImage)}
                            alt={item.productName}
                            className="rounded-2 border bg-white p-1"
                            style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/assets/images/placeholder.jpg';
                            }}
                          />
                          <div>
                            <div className="fw-bold text-dark">{item.productName}</div>
                            <span className="text-muted small">
                              {item.categoryName || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="text-center fw-semibold">{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td className="text-end fw-bold text-primary">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3" className="text-end">
                      Total Amount:
                    </th>
                    <th className="text-end text-primary fs-5">
                      {formatCurrency(order.totalAmount)}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Shipping & Payment Details */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Delivery Details</h5>

            <div className="mb-3">
              <label className="text-muted small fw-semibold">Shipping Address</label>
              <div className="fw-semibold text-dark">{order.shippingAddress}</div>
            </div>

            <div className="mb-3">
              <label className="text-muted small fw-semibold">Payment Method</label>
              <div className="fw-semibold text-dark">
                {order.paymentMethod === 'COD' ? (
                  <>
                    <i className="bi bi-cash-coin text-success me-1"></i> Cash on Delivery (COD)
                  </>
                ) : (
                  <>
                    <i className="bi bi-credit-card text-primary me-1"></i> Mock Payment (Demonstration)
                  </>
                )}
              </div>
            </div>

            <div className="mb-0">
              <label className="text-muted small fw-semibold">Current Order Status</label>
              <div>
                <span
                  className={`badge badge-status badge-status-${order.status} fs-6 px-3 py-2`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          <Link to="/orders" className="btn btn-outline-secondary w-100 py-2">
            <i className="bi bi-arrow-left me-1"></i> Back to My Orders
          </Link>
        </div>
      </div>
    </>
  );
};

export default OrderDetailPage;
