import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AlertMessage from '../../components/common/AlertMessage';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/products';
  const isRegistered = searchParams.get('registered') === 'true';
  const isLoggedOut = searchParams.get('loggedOut') === 'true';
  const isAuthRequired = searchParams.get('error') === 'auth_required';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await login(email, password);
      if (data.user?.role === 'ADMIN' && redirectUrl === '/products') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email address or password. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="row justify-content-center my-4">
      <div className="col-12 col-md-8 col-lg-5">
        <div className="card auth-card shadow-lg border-0">
          <div className="auth-header">
            <i className="bi bi-person-lock display-4 text-info mb-2 d-inline-block"></i>
            <h3 className="fw-bold mb-1">Welcome Back</h3>
            <p className="text-light text-opacity-75 small mb-0">
              Sign in to your customer account or administrator console
            </p>
          </div>

          <div className="card-body p-4 p-md-5">
            {isRegistered && (
              <div className="alert alert-success alert-dismissible fade show shadow-sm border-0 border-start border-4 border-success p-3 mb-4" role="alert">
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success fs-3 me-3"></i>
                  <div>
                    <h6 className="alert-heading fw-bold mb-1">Registration Successful!</h6>
                    <p className="mb-0 small text-success-emphasis">
                      Your account has been created. Please sign in with your credentials.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isLoggedOut && (
              <div className="alert alert-info alert-dismissible fade show small" role="alert">
                <i className="bi bi-info-circle me-1"></i> You have been successfully signed out.
              </div>
            )}

            {isAuthRequired && (
              <div className="alert alert-warning alert-dismissible fade show small" role="alert">
                <i className="bi bi-lock me-1"></i> Please log in with authorized credentials to access this area.
              </div>
            )}

            {error && <AlertMessage type="danger" message={error} onClose={() => setError(null)} />}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="emailInput" className="form-label fw-semibold">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-envelope text-muted"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    id="emailInput"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="passwordInput" className="form-label fw-semibold">
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-key text-muted"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    id="passwordInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fs-6 fw-semibold shadow-sm mb-3"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                  </>
                )}
              </button>

              <div className="text-center small text-muted">
                Don't have an account yet?{' '}
                <Link to="/auth/register" className="fw-semibold text-primary">
                  Create Customer Account
                </Link>
              </div>
            </form>

            {/* Demo Credentials Box */}
            <div className="mt-4 p-3 bg-light rounded-3 border small">
              <div className="fw-bold text-dark mb-2 d-flex justify-content-between align-items-center">
                <span>
                  <i className="bi bi-info-circle-fill text-primary me-1"></i> Demo Credentials
                </span>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                  (Click to auto-fill)
                </span>
              </div>

              <div
                className="d-flex justify-content-between align-items-center text-muted border-bottom py-2"
                style={{ cursor: 'pointer' }}
                onClick={() => fillCredentials('admin@shoppingcart.com', 'Admin@123')}
                title="Click to fill Admin credentials"
              >
                <div>
                  <span className="fw-bold text-dark">Admin:</span> admin@shoppingcart.com
                </div>
                <span className="badge bg-secondary">Admin@123</span>
              </div>

              <div
                className="d-flex justify-content-between align-items-center text-muted py-2"
                style={{ cursor: 'pointer' }}
                onClick={() => fillCredentials('john@example.com', 'Customer@123')}
                title="Click to fill Customer credentials"
              >
                <div>
                  <span className="fw-bold text-dark">Customer:</span> john@example.com
                </div>
                <span className="badge bg-secondary">Customer@123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
