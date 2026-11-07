import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AlertMessage from '../../components/common/AlertMessage';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    termsAgreed: true,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!formData.password || !passRegex.test(formData.password)) {
      newErrors.password = 'Must be at least 8 characters long with both letters and numbers.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.termsAgreed) {
      newErrors.terms = 'You must accept the terms of service.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setSubmitting(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
      });

      // Redirect to login with registered=true flag
      navigate('/auth/login?registered=true');
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Registration failed. Please check your information.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center my-4">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="card auth-card shadow-lg border-0">
          <div className="auth-header">
            <i className="bi bi-person-plus display-4 text-info mb-2 d-inline-block"></i>
            <h3 className="fw-bold mb-1">Create Customer Account</h3>
            <p className="text-light text-opacity-75 small mb-0">
              Join ShopEase to save products, manage orders, and checkout instantly
            </p>
          </div>

          <div className="card-body p-4 p-md-5">
            {serverError && (
              <AlertMessage
                type="danger"
                message={serverError}
                onClose={() => setServerError(null)}
              />
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-semibold">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-person text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control border-start-0 ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Sarah Jenkins"
                    required
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email Address <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-envelope text-muted"></i>
                  </span>
                  <input
                    type="email"
                    className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars (letters+numbers)"
                    required
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="confirmPassword" className="form-label fw-semibold">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-type password"
                    required
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword}</div>
                  )}
                </div>

                <div className="form-text small text-muted">
                  Must be at least 8 characters long and contain both letters and numbers.
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="form-label fw-semibold">
                  Phone Number <span className="text-muted fw-normal">(Optional)</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-telephone text-muted"></i>
                  </span>
                  <input
                    type="tel"
                    className="form-control border-start-0"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    maxLength="20"
                  />
                </div>
              </div>

              <div className="mb-4 form-check small">
                <input
                  type="checkbox"
                  className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`}
                  id="termsCheck"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label text-muted" htmlFor="termsCheck">
                  I agree to the terms of service and understand this is an enterprise demonstration storefront.
                </label>
                {errors.terms && <div className="invalid-feedback">{errors.terms}</div>}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fs-6 fw-semibold shadow-sm mb-3"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-1"></i> Complete Registration
                  </>
                )}
              </button>

              <div className="text-center small text-muted">
                Already have an account?{' '}
                <Link to="/auth/login" className="fw-semibold text-primary">
                  Sign In here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
