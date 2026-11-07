import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getDashboard();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        setError('Failed to load admin dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating real-time database sales and inventory metrics..." />;
  }

  const metrics = data?.metrics || {
    netRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalCustomers: 0,
  };
  const recentOrders = data?.recentOrders || [];
  const lowStock = data?.lowStockProducts || [];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Store Performance Dashboard</h2>
          <p className="text-muted small mb-0">
            Real-time overview of MongoDB sales, inventory, and pending fulfillment
          </p>
        </div>
        <div>
          <Link to="/admin/products/add" className="btn btn-primary btn-sm px-3 shadow-sm">
            <i className="bi bi-plus-circle me-1"></i> Add New Product
          </Link>
        </div>
      </div>

      {error && <AlertMessage type="danger" message={error} />}

      {/* Key Performance Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Net Revenue */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card d-flex align-items-center gap-3">
            <div className="stat-icon bg-success bg-opacity-10 text-success">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div>
              <div className="text-muted small text-uppercase fw-semibold">Net Revenue</div>
              <div className="fs-4 fw-bold text-dark">{formatCurrency(metrics.netRevenue)}</div>
              <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                Excludes cancelled orders
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card d-flex align-items-center gap-3">
            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-cart-check"></i>
            </div>
            <div>
              <div className="text-muted small text-uppercase fw-semibold">Total Orders</div>
              <div className="fs-4 fw-bold text-dark">{metrics.totalOrders}</div>
              <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                Lifetime volume
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card d-flex align-items-center gap-3">
            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
              <i className="bi bi-clock-history"></i>
            </div>
            <div>
              <div className="text-muted small text-uppercase fw-semibold">Pending Orders</div>
              <div className="fs-4 fw-bold text-dark">{metrics.pendingOrders}</div>
              <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                Awaiting packing/shipping
              </div>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card d-flex align-items-center gap-3">
            <div className="stat-icon bg-info bg-opacity-10 text-info">
              <i className="bi bi-people"></i>
            </div>
            <div>
              <div className="text-muted small text-uppercase fw-semibold">Customers</div>
              <div className="fs-4 fw-bold text-dark">{metrics.totalCustomers}</div>
              <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                Registered accounts
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Recent Orders Table */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Recent Orders</h5>
              <Link to="/admin/orders" className="small text-primary text-decoration-none fw-semibold">
                View All Orders <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-4 text-muted small">No recent orders recorded.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => {
                      const orderNum = o.orderNumber || o._id;
                      return (
                        <tr key={o._id}>
                          <td className="fw-bold">#{orderNum}</td>
                          <td>
                            <div className="fw-semibold text-dark">{o.customerName}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {o.customerEmail}
                            </div>
                          </td>
                          <td className="fw-bold text-primary">{formatCurrency(o.totalAmount)}</td>
                          <td>
                            <span className={`badge badge-status badge-status-${o.status}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <Link
                              to={`/admin/orders/${o._id || orderNum}`}
                              className="btn btn-outline-primary btn-sm py-0 px-2"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-danger d-flex align-items-center gap-1">
                <i className="bi bi-exclamation-triangle-fill"></i> Low Stock Alerts
              </h5>
              <span className="badge bg-danger rounded-pill">{lowStock.length}</span>
            </div>

            {lowStock.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <i className="bi bi-check-circle text-success fs-3 d-block mb-1"></i>
                All product inventories are well-stocked (&gt; 5 units).
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {lowStock.map((p) => (
                  <div
                    key={p._id}
                    className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center border-bottom"
                  >
                    <div>
                      <div className="fw-semibold text-dark small">{p.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {p.category?.name || 'Item'} &bull; {formatCurrency(p.price)}
                      </div>
                    </div>
                    <div className="text-end">
                      <span
                        className={`badge ${p.stockQty === 0 ? 'bg-danger' : 'bg-warning text-dark'} mb-1`}
                      >
                        {p.stockQty} left
                      </span>
                      <div>
                        <Link
                          to={`/admin/products/edit/${p._id}`}
                          className="small text-decoration-none"
                        >
                          Restock <i className="bi bi-pencil-square"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
