import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getUsers();
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (err) {
        setAlert({ type: 'danger', message: 'Failed to load user directory.' });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Registered Users &amp; Customers</h2>
          <p className="text-muted small mb-0">
            Total of <strong>{users.length}</strong> accounts registered in the MongoDB database
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

      <div className="card border-0 shadow-sm overflow-hidden mb-4">
        {loading ? (
          <LoadingSpinner message="Auditing registered user directory..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th className="ps-3">User ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Phone</th>
                  <th>System Role</th>
                  <th className="pe-3">Registered At</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const firstLetter = u.name ? u.name.charAt(0).toUpperCase() : 'U';
                    const userId = u.id || u._id;
                    const displayId =
                      typeof userId === 'string' && userId.length >= 6
                        ? userId.substring(userId.length - 6)
                        : userId;

                    return (
                      <tr key={u.id || u._id}>
                        <td className="ps-3 fw-bold text-muted small">#{displayId}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-secondary bg-opacity-10 text-secondary d-flex align-items-center justify-content-center fw-bold"
                              style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}
                            >
                              {firstLetter}
                            </div>
                            <span className="fw-bold text-dark">{u.name}</span>
                          </div>
                        </td>
                        <td>
                          <code>{u.email}</code>
                        </td>
                        <td>{u.phone || '-'}</td>
                        <td>
                          {u.role === 'ADMIN' ? (
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-shield-lock-fill me-1"></i> ADMIN
                            </span>
                          ) : (
                            <span className="badge bg-info text-dark">
                              <i className="bi bi-person-fill me-1"></i> CUSTOMER
                            </span>
                          )}
                        </td>
                        <td className="pe-3 small text-muted">{formatDate(u.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="alert alert-light border small text-muted">
        <i className="bi bi-shield-check text-success me-1"></i>
        <strong>Security Policy:</strong> Password hashes are strictly omitted from directory queries and will never be rendered in administration interfaces.
      </div>
    </>
  );
};

export default UserListPage;
