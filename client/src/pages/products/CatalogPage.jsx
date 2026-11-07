import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../services/api';
import ProductCard from '../../components/products/ProductCard';
import CategorySidebar from '../../components/products/CategorySidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters from URL query params
  const currentCategory = searchParams.get('category') || null;
  const currentSearch = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
  });

  // Fetch categories on mount
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

  // Fetch products whenever search params change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 12,
        };
        if (currentCategory) params.category = currentCategory;
        if (currentSearch) params.q = currentSearch;
        if (currentSort) params.sort = currentSort;

        const res = await productAPI.getAll(params);
        if (res.data.success) {
          setProducts(res.data.products);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        setAlert({ type: 'danger', message: 'Unable to load products. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory, currentSearch, currentSort, currentPage]);

  const handleSelectCategory = (catId) => {
    const newParams = new URLSearchParams(searchParams);
    if (catId) {
      newParams.set('category', catId);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    const val = e.target.value;
    if (val) {
      newParams.set('sort', val);
    } else {
      newParams.delete('sort');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleClearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const isInitialHome = !currentSearch && !currentCategory && currentPage === 1;

  return (
    <>
      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Hero Banner (Shown only on initial page load without active search or category filters) */}
      {isInitialHome && (
        <div className="hero-banner mb-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-primary text-uppercase px-3 py-2 mb-2 shadow-sm">
                <i className="bi bi-patch-check-fill me-1"></i> Live Product Catalog
              </span>
              <h1 className="display-5 fw-bold mb-3">
                Premium Quality, <span className="brand-gradient">Instant Delivery.</span>
              </h1>
              <p className="lead text-light text-opacity-75 mb-4">
                Explore our diverse collection across 10 categories including Electronics, Fashion,
                Footwear, Home &amp; Kitchen, Beauty, Books, Sports, Accessories, Toys, and Stationery.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <a href="#catalogGrid" className="btn btn-primary px-4 py-2 shadow">
                  <i className="bi bi-bag-check me-1"></i> Explore {pagination.totalCount || 85} Products
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Section */}
      <div className="row g-4" id="catalogGrid">
        {/* Category Sidebar */}
        <CategorySidebar
          categories={categories}
          selectedCategory={currentCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Main Products Listing */}
        <div className="col-12 col-md-8 col-lg-9">
          {/* Sort and Controls Bar */}
          <div className="card border-0 shadow-sm p-3 mb-4">
            <div className="row align-items-center justify-content-between g-2">
              <div className="col-12 col-sm-6">
                <span className="text-muted small">
                  Showing <strong>{products.length}</strong> of{' '}
                  <strong>{pagination.totalCount}</strong> items
                  {currentSearch && (
                    <>
                      {' '}
                      for "
                      <span className="text-dark fw-bold">{currentSearch}</span>"
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="btn btn-link text-danger p-0 ms-1 border-0"
                        title="Clear Search"
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    </>
                  )}
                </span>
              </div>

              <div className="col-12 col-sm-6 text-sm-end">
                <div className="d-inline-flex align-items-center gap-2">
                  <label htmlFor="sortSelect" className="small text-muted text-nowrap">
                    Sort By:
                  </label>
                  <select
                    id="sortSelect"
                    className="form-select form-select-sm"
                    value={currentSort}
                    onChange={handleSortChange}
                  >
                    <option value="">Featured / Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <LoadingSpinner message="Fetching products from catalog..." />
          ) : products.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-4">
              <i className="bi bi-bag-x display-3 text-muted mb-3 d-inline-block"></i>
              <h4 className="fw-bold">No Products Found</h4>
              <p className="text-muted small mb-4">
                {currentSearch
                  ? `No products matched your search for "${currentSearch}".`
                  : 'There are currently no products available in this category.'}
              </p>
              {(currentSearch || currentCategory) && (
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={() => setSearchParams({})}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4 mb-4">
              {products.map((product) => (
                <div className="col" key={product._id || product.id}>
                  <ProductCard
                    product={product}
                    onAddSuccess={(msg) => setAlert({ type: 'success', message: msg })}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <nav aria-label="Catalog pagination" className="my-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    &laquo; Previous
                  </button>
                </li>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <li
                    key={pageNum}
                    className={`page-item ${pageNum === currentPage ? 'active' : ''}`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </>
  );
};

export default CatalogPage;
