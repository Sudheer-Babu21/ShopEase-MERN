import React from 'react';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const iconMap = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-octagon-fill',
    info: 'bi-info-circle-fill',
  };

  return (
    <div className={`alert alert-${type} alert-dismissible fade show shadow-sm`} role="alert">
      <div className="d-flex align-items-center">
        <i className={`bi ${iconMap[type] || 'bi-info-circle'} me-2 fs-5`}></i>
        <div className="flex-grow-1">{message}</div>
        {onClose && (
          <button
            type="button"
            className="btn-close ms-2"
            aria-label="Close"
            onClick={onClose}
          ></button>
        )}
      </div>
    </div>
  );
};

export default AlertMessage;
