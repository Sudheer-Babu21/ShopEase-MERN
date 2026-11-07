import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI, categoryAPI } from '../../services/api';
import { getImageUrl } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stockQty: '10',
    description: '',
    isActive: true,
  });

  const [existingImagePath, setExistingImagePath] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Load categories and product data if edit
  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await categoryAPI.getAll();
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }

        if (isEdit) {
          const prodRes = await adminAPI.getProductById(id);
          if (prodRes.data.success && prodRes.data.product) {
            const p = prodRes.data.product;
            setFormData({
              name: p.name,
              categoryId: p.category?._id || p.category || '',
              price: String(p.price),
              stockQty: String(p.stockQty),
              description: p.description || '',
              isActive: p.isActive,
            });
            setExistingImagePath(p.imagePath || '');
            setPreviewUrl(getImageUrl(p.imagePath));
          }
        }
      } catch (err) {
        setAlert({ type: 'danger', message: 'Failed to load form data.' });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setAlert({
          type: 'danger',
          message: 'The selected image exceeds the 2MB size limit. Please choose a smaller image.',
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAlert(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setAlert({ type: 'danger', message: 'Product name must be at least 2 characters long.' });
      return;
    }

    if (!formData.categoryId) {
      setAlert({ type: 'danger', message: 'Please select a valid category.' });
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setAlert({ type: 'danger', message: 'Please enter a valid non-negative price.' });
      return;
    }

    const stockNum = parseInt(formData.stockQty, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setAlert({ type: 'danger', message: 'Stock quantity must be a non-negative integer.' });
      return;
    }

    try {
      setSaving(true);
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('category', formData.categoryId);
      data.append('price', String(priceNum));
      data.append('stockQty', String(stockNum));
      data.append('description', formData.description.trim());
      data.append('isActive', String(formData.isActive));

      if (selectedFile) {
        data.append('imageFile', selectedFile);
      } else if (existingImagePath) {
        data.append('existingImagePath', existingImagePath);
      }

      if (isEdit) {
        await adminAPI.updateProduct(id, data);
      } else {
        await adminAPI.createProduct(data);
      }

      navigate('/admin/products');
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to save product.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product configuration..." />;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <div className="card border-0 shadow-sm p-4 p-md-5 mb-4">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
            <h4 className="fw-bold mb-0">
              <i
                className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-circle'} me-2 text-primary`}
              ></i>
              {isEdit ? `Edit Product #${id}` : 'Add New Product'}
            </h4>
            <Link to="/admin/products" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-1"></i> Back to Products
            </Link>
          </div>

          {alert && (
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-8">
                <label htmlFor="name" className="form-label fw-semibold">
                  Product Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  minLength="2"
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="categoryId" className="form-label fw-semibold">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.categoryId} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="price" className="form-label fw-semibold">
                  Price (₹ INR) <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    className="form-control"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label htmlFor="stockQty" className="form-label fw-semibold">
                  Stock Quantity <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  id="stockQty"
                  name="stockQty"
                  value={formData.stockQty}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label fw-semibold">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Key specifications, materials, warranty, features..."
              ></textarea>
            </div>

            {/* Image Upload Section */}
            <div className="card bg-light border p-3 mb-4">
              <label className="form-label fw-semibold mb-1">Product Image</label>
              <p className="small text-muted mb-2">
                Max file size: 2MB. Supported formats: JPG, PNG, WEBP.
              </p>

              <div className="d-flex align-items-center gap-3">
                <div
                  style={{ width: '80px', height: '80px' }}
                  className="border rounded bg-white overflow-hidden d-flex align-items-center justify-content-center p-1"
                >
                  <img
                    src={previewUrl || '/assets/images/placeholder.jpg'}
                    alt="Preview"
                    className="img-fluid"
                    style={{ maxHeight: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/images/placeholder.jpg';
                    }}
                  />
                </div>

                <div className="flex-grow-1">
                  <input
                    className="form-control"
                    type="file"
                    id="imageFileInput"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                  />
                  {isEdit && existingImagePath && (
                    <div className="form-text small text-muted">
                      Current file: <code>{existingImagePath}</code> (Leave empty to keep existing).
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Status Switch */}
            <div className="form-check form-switch mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="activeSwitch"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              <label className="form-check-label fw-semibold" htmlFor="activeSwitch">
                Product is Active &amp; Visible in Storefront
              </label>
            </div>

            <div className="d-flex justify-content-end gap-2 border-top pt-3">
              <Link to="/admin/products" className="btn btn-outline-secondary px-4">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary px-4 shadow-sm" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-1"></i> Save Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductFormPage;
