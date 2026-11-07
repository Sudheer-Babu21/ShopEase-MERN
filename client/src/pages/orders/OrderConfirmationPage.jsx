import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { formatCurrency, formatDate, getImageUrl } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderAPI.getById(id);
        if (res.data.success && res.data.order) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order confirmation details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Retrieving order confirmation..." />;
  }

  const orderNum = order?.orderNumber || order?._id || id;

  return (
    <div className="row justify-content-center my-4">
      <div className="col-12 col-lg-8">
        <div className="card border-0 shadow-sm p-4 p-md-5 mb-4 text-center">
          <div className="display-3 text-success mb-3">
            <i className="bi bi-patch-check-fill"></i>
          </div>
          <h2 className="fw-bold text-dark mb-1">Thank You for Your Order!</h2>
          <p className="text-muted mb-4">
            Your order <strong>#{orderNum}</strong> has been placed and confirmed into our MongoDB database.
          </p>

          <div className="d-flex justify-content-center gap-3">
            <Link to={`/orders/${order?._id || orderNum}`} className="btn btn-primary px-4">
              <i className="bi bi-receipt me-1"></i> View Order Details
            </Link>
            <Link to="/products" className="btn btn-outline-secondary px-4">
              Continue Shopping
            </Link>
          </div>
        </div>

        {order && (
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Order Summary</h5>
            <div className="row g-3 mb-4 small">
              <div className="col-6 col-md-3">
                <div className="text-muted">Order Date</div>
                <div className="fw-bold">{formatDate(order.orderDate)}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Payment Method</div>
                <div className="fw-bold">{order.paymentMethod}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Current Status</div>
                <div>
                  <span className={`badge badge-status badge-status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-muted">Total Amount</div>
                <div className="fw-bold text-primary fs-6">
                  {formatCurrency(order.totalAmount)}
                </div>
              </div>
              <div className="col-12">
                <div className="text-muted">Delivery Address</div>
                <div className="fw-semibold">{order.shippingAddress}</div>
              </div>
            </div>

            <h6 className="fw-bold mb-2">Purchased Items</h6>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={item._id || idx}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={getImageUrl(item.productImage)}
                            alt={item.productName}
                            className="rounded border bg-white p-1"
                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/assets/images/placeholder.jpg';
                            }}
                          />
                          <span className="fw-semibold small">{item.productName}</span>
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td className="text-end fw-bold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3" className="text-end">
                      Total Paid:
                    </th>
                    <th className="text-end text-primary fs-6">
                      {formatCurrency(order.totalAmount)}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
