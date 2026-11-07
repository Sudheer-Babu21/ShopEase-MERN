import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../services/api';
import AlertMessage from '../../components/common/AlertMessage';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileAlert(null);

    if (!name.trim() || name.trim().length < 2) {
      setProfileAlert({ type: 'danger', message: 'Name must be at least 2 characters long.' });
      return;
    }

    try {
      setSavingProfile(true);
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setProfileAlert({ type: 'success', message: 'Profile information updated successfully.' });
    } catch (err) {
      setProfileAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordAlert(null);

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwords.newPassword || !passRegex.test(passwords.newPassword)) {
      setPasswordAlert({
        type: 'danger',
        message: 'New password must be at least 8 characters long and contain both letters and numbers.',
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordAlert({ type: 'danger', message: 'New password and confirmation do not match.' });
      return;
    }

    try {
      setSavingPassword(true);
      const res = await profileAPI.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });

      if (res.data.success) {
        setPasswordAlert({ type: 'success', message: 'Password updated successfully!' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="row g-4 mb-5">
      <div className="col-12">
        <h2 className="fw-bold mb-1">
          <i className="bi bi-person-circle me-2 text-primary"></i>My Profile
        </h2>
        <p className="text-muted small">Manage your account information and security preferences</p>
      </div>

      {/* Personal Info Card */}
      <div className="col-12 col-md-6">
        <div className="card border-0 shadow-sm p-4 h-100">
          <h5 className="fw-bold mb-3 border-bottom pb-2">Profile Information</h5>

          {profileAlert && (
            <AlertMessage
              type={profileAlert.type}
              message={profileAlert.message}
              onClose={() => setProfileAlert(null)}
            />
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                className="form-control bg-light"
                value={user?.email || ''}
                readOnly
              />
              <div className="form-text small text-muted">
                Email addresses are unique and cannot be modified.
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="nameInput" className="form-label small fw-semibold">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="nameInput"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength="2"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phoneInput" className="form-label small fw-semibold">
                Phone Number
              </label>
              <input
                type="tel"
                className="form-control"
                id="phoneInput"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
              />
            </div>

            <button type="submit" className="btn btn-primary px-4" disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Saving Changes...
                </>
              ) : (
                <>
                  <i className="bi bi-check2 me-1"></i> Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Password Modification Card */}
      <div className="col-12 col-md-6">
        <div className="card border-0 shadow-sm p-4 h-100">
          <h5 className="fw-bold mb-3 border-bottom pb-2">Security &amp; Password</h5>

          {passwordAlert && (
            <AlertMessage
              type={passwordAlert.type}
              message={passwordAlert.message}
              onClose={() => setPasswordAlert(null)}
            />
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label htmlFor="currPass" className="form-label small fw-semibold">
                Current Password
              </label>
              <input
                type="password"
                className="form-control"
                id="currPass"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="newPass" className="form-label small fw-semibold">
                New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="newPass"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                required
                minLength="8"
              />
              <div className="form-text small text-muted">
                Minimum 8 characters with letters and numbers.
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPass" className="form-label small fw-semibold">
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPass"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                required
                minLength="8"
              />
            </div>

            <button type="submit" className="btn btn-outline-primary px-4" disabled={savingPassword}>
              {savingPassword ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Updating...
                </>
              ) : (
                <>
                  <i className="bi bi-shield-lock me-1"></i> Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
