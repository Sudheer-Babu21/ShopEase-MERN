import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';

const CategoryListPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCategories();
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to load categories.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleStartEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setAlert(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!name.trim() || name.trim().length < 2) {
      setAlert({ type: 'danger', message: 'Category name must be at least 2 characters long.' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        const res = await adminAPI.updateCategory(editingCategory._id, {
          name: name.trim(),
          description: description.trim(),
        });
        if (res.data.success) {
          setAlert({ type: 'success', message: 'Category updated successfully.' });
          handleCancelEdit();
          fetchCategories();
        }
      } else {
        const res = await adminAPI.createCategory({
          name: name.trim(),
          description: description.trim(),
        });
        if (res.data.success) {
          setAlert({ type: 'success', message: 'Category created successfully.' });
          setName('');
          setDescription('');
          fetchCategories();
        }
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to save category.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        `Are you sure you want to delete category '${cat.name}'? Deletion will be rejected if products are attached.`
      )
    ) {
      return;
    }

    try {
      const res = await adminAPI.deleteCategory(cat._id);
      if (res.data.success) {
        setAlert({ type: 'success', message: res.data.message });
        setCategories((prev) => prev.filter((c) => c._id !== cat._id));
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message:
          err.response?.data?.message ||
          'Failed to delete category due to attached products or server constraint.',
      });
    }
  };

  return (
    <div className="row g-4 mb-5">
      <div className="col-12">
        <h2 className="fw-bold mb-1">Product Categories</h2>
        <p className="text-muted small">
          Organize your product catalog into structured customer-facing classifications
        </p>
      </div>

      {alert && (
        <div className="col-12">
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {/* Add / Edit Form Column */}
      <div className="col-12 col-lg-4">
        <div className="card border-0 shadow-sm p-4 sticky-top" style={{ top: '85px' }}>
          <h5 className="fw-bold mb-3 border-bottom pb-2">
            <i
              className={`bi ${editingCategory ? 'bi-pencil-square text-warning' : 'bi-plus-circle text-primary'} me-1`}
            ></i>
            {editingCategory
              ? `Edit Category #${editingCategory.categoryId || ''}`
              : 'Create Category'}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="catName" className="form-label small fw-semibold">
                Category Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="catName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength="2"
                placeholder="e.g. Smart Home"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="catDesc" className="form-label small fw-semibold">
                Description
              </label>
              <textarea
                className="form-control"
                id="catDesc"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of category products..."
              ></textarea>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary flex-grow-1 shadow-sm"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2 me-1"></i>{' '}
                    {editingCategory ? 'Update Category' : 'Save Category'}
                  </>
                )}
              </button>

              {editingCategory && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Category Listing Table Column */}
      <div className="col-12 col-lg-8">
        <div className="card border-0 shadow-sm overflow-hidden">
          {loading ? (
            <LoadingSpinner message="Loading product categories..." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th className="ps-3">ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        No categories created yet.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat._id || cat.categoryId}>
                        <td className="ps-3 fw-bold text-muted small">
                          #{cat.categoryId || cat._id.substring(18)}
                        </td>
                        <td>
                          <span className="fw-bold text-dark">{cat.name}</span>
                        </td>
                        <td className="text-muted small">{cat.description || '-'}</td>
                        <td className="text-end pe-3">
                          <div className="d-inline-flex gap-1">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              title="Edit Category"
                              onClick={() => handleStartEdit(cat)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              title="Delete Category"
                              onClick={() => handleDelete(cat)}
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryListPage;
