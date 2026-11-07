import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminAPI, categoryAPI } from '../../services/api';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryAPI.getAll();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 15,
      };
      if (searchParams.get('q')) params.q = searchParams.get('q');
      if (searchParams.get('category')) params.category = searchParams.get('category');

      const res = await adminAPI.getProducts(params);
      if (res.data.success) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to load products.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchTerm.trim()) newParams.set('q', searchTerm.trim());
    if (selectedCategory) newParams.set('category', selectedCategory);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSearchParams({});
  };

  const handleToggleActive = async (product) => {
    const action = product.isActive ? 'deactivate (soft-delete)' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} '${product.name}'?`)) return;

    try {
      const res = await adminAPI.toggleActive(product._id);
      if (res.data.success) {
        setAlert({ type: 'success', message: res.data.message });
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, isActive: res.data.isActive } : p))
        );
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to toggle product status.' });
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Permanently delete product '${product.name}'? This action cannot be undone.`)) return;

    try {
      const res = await adminAPI.deleteProduct(product._id);
      if (res.data.success) {
        setAlert({ type: 'info', message: res.data.message });
        setProducts((prev) => prev.filter((p) => p._id !== product._id));
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to delete product.' });
    }
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Product Catalog Directory</h2>
          <p className="text-muted small mb-0">
            Total of <strong>{pagination.totalCount}</strong> products tracked across all categories
          </p>
        </div>
        <div>
          <Link to="/admin/products/add" className="btn btn-primary btn-sm px-3 shadow-sm">
            <i className="bi bi-plus-circle me-1"></i> Add New Product
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

      {/* Filter and Search Bar */}
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
                placeholder="Search products by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.categoryId} value={cat._id}>
                  {cat.name}
                </option>
              ))}
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

      {/* Products Table */}
      <div className="card border-0 shadow-sm overflow-hidden mb-4">
        {loading ? (
          <LoadingSpinner message="Loading products list..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th className="ps-3">ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No products found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const prodNum = p.productId || p._id;
                    return (
                      <tr key={p._id}>
                        <td className="ps-3 fw-bold text-muted small">#{prodNum}</td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={getImageUrl(p.imagePath)}
                              alt={p.name}
                              className="rounded border bg-white p-1"
                              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/assets/images/placeholder.jpg';
                              }}
                            />
                            <div>
                              <div className="fw-bold text-dark">{p.name}</div>
                              <div
                                className="text-muted small text-truncate"
                                style={{ maxWidth: '250px' }}
                              >
                                {p.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {p.category?.name || 'General'}
                          </span>
                        </td>
                        <td className="fw-bold text-primary">{formatCurrency(p.price)}</td>
                        <td>
                          {p.stockQty <= 0 ? (
                            <span className="badge bg-danger">0 (Out of stock)</span>
                          ) : p.stockQty <= 5 ? (
                            <span className="badge bg-warning text-dark">{p.stockQty} units</span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              {p.stockQty} units
                            </span>
                          )}
                        </td>
                        <td>
                          {p.isActive ? (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i> Active
                            </span>
                          ) : (
                            <span className="badge bg-secondary">
                              <i className="bi bi-dash-circle me-1"></i> Deactivated
                            </span>
                          )}
                        </td>
                        <td className="text-end pe-3">
                          <div className="d-inline-flex gap-1">
                            <Link
                              to={`/admin/products/edit/${p._id}`}
                              className="btn btn-outline-primary btn-sm"
                              title="Edit Product"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </Link>

                            <button
                              type="button"
                              className={`btn btn-sm ${p.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              title={p.isActive ? 'Deactivate (Soft-delete)' : 'Reactivate'}
                              onClick={() => handleToggleActive(p)}
                            >
                              <i className={`bi ${p.isActive ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              title="Delete Product"
                              onClick={() => handleDelete(p)}
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
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

export default ProductListPage;
