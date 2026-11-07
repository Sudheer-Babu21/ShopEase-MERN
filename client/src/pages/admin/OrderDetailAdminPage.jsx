import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatCurrency, formatDate, getImageUrl } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';

const OrderDetailAdminPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getOrderById(id);
      if (res.data.success && res.data.order) {
        setOrder(res.data.order);
        // Pre-select first allowed status if not terminal
        const cur = res.data.order.status;
        if (cur === 'PLACED') setSelectedStatus('PACKED');
        else if (cur === 'PACKED') setSelectedStatus('SHIPPED');
        else if (cur === 'SHIPPED') setSelectedStatus('DELIVERED');
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to load order fulfillment record.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    if (
      selectedStatus === 'CANCELLED' &&
      !window.confirm(
        'Are you sure you want to CANCEL this order? Cancellation will automatically restore item quantities to product catalog stock.'
      )
    ) {
      return;
    }

    try {
      setUpdating(true);
      const res = await adminAPI.updateOrderStatus(order._id, selectedStatus);
      if (res.data.success) {
        setAlert({ type: 'success', message: res.data.message });
        setOrder(res.data.order);
        const cur = res.data.order.status;
        if (cur === 'PACKED') setSelectedStatus('SHIPPED');
        else if (cur === 'SHIPPED') setSelectedStatus('DELIVERED');
        else setSelectedStatus('');
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update order status.',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving order fulfillment details..." />;
  }

  if (!order) {
    return (
      <div className="card border-0 shadow-sm p-5 text-center my-4">
        <i className="bi bi-shield-x display-3 text-danger mb-3"></i>
        <h4 className="fw-bold">Order Record Not Found</h4>
        <p className="text-muted">The requested order could not be located in the database.</p>
        <div>
          <Link to="/admin/orders" className="btn btn-primary px-4">
            <i className="bi bi-arrow-left me-1"></i> Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderNum = order.orderNumber || order._id;
  const currentStatus = order.status;
  const isTerminal = currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED';

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">
            Order Fulfillment #{orderNum}
            <span className={`badge badge-status badge-status-${currentStatus} fs-6 ms-2`}>
              {currentStatus}
            </span>
          </h2>
          <p className="text-muted small mb-0">
            Placed by {order.customerName} on {formatDate(order.orderDate)}
          </p>
        </div>
        <div>
          <Link to="/admin/orders" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i> Back to Orders
          </Link>
        </div>
      </div>

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="row g-4 mb-5">
        {/* Order Items List */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Purchased Items</h5>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Product</th>
                    <th className="text-center">Quantity</th>
                    <th>Historical Price</th>
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
                            style={{ width: '44px', height: '44px', objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/assets/images/placeholder.jpg';
                            }}
                          />
                          <div>
                            <div className="fw-semibold text-dark">{item.productName}</div>
                            <span className="text-muted small">
                              Category: {item.categoryName || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="text-center fw-bold">{item.quantity}</td>
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
                      Order Total:
                    </th>
                    <th className="text-end text-primary fs-5">
                      {formatCurrency(order.totalAmount)}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Customer & Shipping Summary Card */}
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Customer &amp; Shipping Summary</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="text-muted small fw-semibold">Customer</label>
                <div className="fw-bold text-dark">{order.customerName}</div>
                <div className="text-muted small">{order.customerEmail}</div>
                {order.customerPhone && (
                  <div className="text-muted small">Phone: {order.customerPhone}</div>
                )}
              </div>
              <div className="col-md-6">
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
              <div className="col-12">
                <label className="text-muted small fw-semibold">Shipping Address</label>
                <div className="p-3 bg-light rounded-3 text-dark fw-semibold">
                  {order.shippingAddress}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* State Machine Transition Column */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 sticky-top" style={{ top: '85px' }}>
            <h5 className="fw-bold mb-3 border-bottom pb-2">Lifecycle Management</h5>

            <div className="mb-3">
              <label className="text-muted small fw-semibold">Current State</label>
              <div>
                <span className={`badge badge-status badge-status-${currentStatus} fs-6`}>
                  {currentStatus}
                </span>
              </div>
            </div>

            {isTerminal ? (
              <div className="alert alert-secondary small mb-0">
                <i className="bi bi-info-circle me-1"></i>
                This order is in a terminal status (<strong>{currentStatus}</strong>) and cannot be modified further.
              </div>
            ) : (
              <form onSubmit={handleStatusUpdate}>
                <div className="mb-3">
                  <label htmlFor="statusSelect" className="form-label small fw-semibold">
                    Advance Status To:
                  </label>
                  <select
                    id="statusSelect"
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    required
                  >
                    {currentStatus === 'PLACED' && (
                      <>
                        <option value="PACKED">PACKED (Order packaged in warehouse)</option>
                        <option value="CANCELLED">CANCELLED (Cancel &amp; restore stock)</option>
                      </>
                    )}
                    {currentStatus === 'PACKED' && (
                      <>
                        <option value="SHIPPED">SHIPPED (Handed to carrier courier)</option>
                        <option value="CANCELLED">CANCELLED (Cancel &amp; restore stock)</option>
                      </>
                    )}
                    {currentStatus === 'SHIPPED' && (
                      <>
                        <option value="DELIVERED">DELIVERED (Customer delivery confirmed)</option>
                        <option value="CANCELLED">CANCELLED (Cancel &amp; restore stock)</option>
                      </>
                    )}
                  </select>
                  <div className="form-text small text-muted">
                    Status transitions are strictly validated according to the finite state machine.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
                  disabled={updating || !selectedStatus}
                >
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-1"></i> Update Status
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailAdminPage;
