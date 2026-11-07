import React from 'react';
import { getCategoryIcon } from '../../utils/helpers';

const CategorySidebar = ({ categories = [], selectedCategory, onSelectCategory }) => {
  return (
    <div className="col-12 col-md-4 col-lg-3">
      {/* Category Card */}
      <div className="card border-0 shadow-sm p-3 mb-4 sticky-top" style={{ top: '80px', zIndex: 10 }}>
        <h6 className="fw-bold text-dark text-uppercase mb-3 d-flex align-items-center justify-content-between">
          <span>Categories</span>
          <i className="bi bi-funnel text-muted"></i>
        </h6>

        <div className="d-flex flex-column gap-1">
          {/* All Categories Button */}
          <button
            type="button"
            className={`category-filter-item ${!selectedCategory ? 'active' : ''}`}
            onClick={() => onSelectCategory(null)}
          >
            <span>
              <i className="bi bi-grid-fill me-2 text-primary"></i>All Categories
            </span>
            <i className="bi bi-chevron-right small"></i>
          </button>

          {/* Each Category */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat._id || selectedCategory === String(cat.categoryId);
            return (
              <button
                key={cat._id || cat.categoryId}
                type="button"
                className={`category-filter-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat._id)}
              >
                <span>
                  <i className={`bi ${getCategoryIcon(cat.name)} me-2 text-secondary`}></i>
                  {cat.name}
                </span>
                <i className="bi bi-chevron-right small"></i>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trust & Security Box matching reference */}
      <div className="card bg-dark text-white border-0 shadow-sm p-3 d-none d-md-block mb-4">
        <h6 className="fw-bold text-warning mb-2">
          <i className="bi bi-shield-check me-1"></i> Verified Inventory
        </h6>
        <p className="small text-secondary mb-2">
          Live stock availability synced with MongoDB Community Server. Concurrency-safe atomic checkout with inventory reservation.
        </p>
        <div className="small text-light text-opacity-75">
          <i className="bi bi-truck text-info me-1"></i> Fast Shipping &bull; COD Available
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;
