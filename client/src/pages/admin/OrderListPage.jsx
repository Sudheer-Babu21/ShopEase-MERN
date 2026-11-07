import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';

const OrderListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 15,
      };
      if (searchParams.get('q')) params.q = searchParams.get('q');
      if (searchParams.get('status')) params.status = searchParams.get('status');

      const res = await adminAPI.getOrders(params);
      if (res.data.success) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to load orders directory.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchTerm.trim()) newParams.set('q', searchTerm.trim());
    if (selectedStatus) newParams.set('status', selectedStatus);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Customer Orders Directory</h2>
          <p className="text-muted small mb-0">
            Total of <strong>{pagination.totalCount}</strong> orders tracked across all lifecycle stages
          </p>
        </div>
      </div>

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search & Status Filter Form */}
      <div className="card border-0 shadow-sm p-3 mb-4">
        <form onSubmit={handleFilterSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by Order ID, customer name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PLACED">PLACED</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="col-12 col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-secondary px-3 w-100">
              Filter
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="card border-0 shadow-sm overflow-hidden mb-4">
        {loading ? (
          <LoadingSpinner message="Loading customer orders..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th className="ps-3">Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No orders match the selected filters.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const orderNum = o.orderNumber || o._id;
                    return (
                      <tr key={o._id}>
                        <td className="ps-3 fw-bold text-dark">#{orderNum}</td>
                        <td>
                          <div className="fw-semibold text-dark">{o.customerName}</div>
                          <div className="text-muted small">{o.customerEmail}</div>
                        </td>
                        <td className="small text-muted">{formatDate(o.orderDate)}</td>
                        <td className="fw-bold text-primary">{formatCurrency(o.totalAmount)}</td>
                        <td>
                          <span className="badge bg-light text-dark border">{o.paymentMethod}</span>
                        </td>
                        <td>
                          <span className={`badge badge-status badge-status-${o.status}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="text-end pe-3">
                          <Link
                            to={`/admin/orders/${o._id || orderNum}`}
                            className="btn btn-outline-primary btn-sm px-3"
                          >
                            <i className="bi bi-gear me-1"></i> Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <nav className="my-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                &laquo; Prev
              </button>
            </li>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <li key={pageNum} className={`page-item ${pageNum === currentPage ? 'active' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage >= pagination.totalPages ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
              >
                Next &raquo;
              </button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default OrderListPage;
