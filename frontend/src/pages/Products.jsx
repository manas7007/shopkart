import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, PackageOpen } from 'lucide-react';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { ProductCardSkeleton, EmptyState, ErrorAlert } from '../components/UIState.jsx';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read current URL query parameters
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'All';
  const currentSort = searchParams.get('sort') || '';

  // Local state for instant controlled search input
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Sync search input if URL changes
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        if (res.data?.categories) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.warn('Could not fetch categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products matching search, category, sort
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (currentSearch.trim()) params.search = currentSearch.trim();
      if (currentCategory && currentCategory !== 'All') params.category = currentCategory;
      if (currentSort) params.sort = currentSort;

      const res = await api.get('/products', { params });
      if (res.data?.products) {
        setProducts(res.data.products);
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentCategory, currentSort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  // Handle Category select
  const handleCategoryChange = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  // Handle Sort change
  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) {
      newParams.set('sort', e.target.value);
    } else {
      newParams.delete('sort');
    }
    setSearchParams(newParams);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasActiveFilters = currentSearch || (currentCategory && currentCategory !== 'All') || currentSort;

  return (
    <div className="space-y-8 pb-16">
      {/* Header and Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse through our verified collection of authentic items
          </p>
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products by name..."
              className="w-full pl-11 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
            >
              Search
            </button>
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Sort by:
            </span>
            <select
              value={currentSort}
              onChange={handleSortChange}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Featured / Latest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
            Categories:
          </span>
          <button
            onClick={() => handleCategoryChange('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentCategory === 'All'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="ml-auto inline-flex items-center text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorAlert message={error} onRetry={fetchProducts} />}

      {/* Product Grid / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <ProductCardSkeleton key={n} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No Products Found"
          description={
            hasActiveFilters
              ? 'No products matched your current filter criteria. Try clearing search or selecting a different category.'
              : 'Our store inventory is currently updating. Please check back shortly.'
          }
          actionText={hasActiveFilters ? 'Clear All Filters' : 'Refresh Catalog'}
          onAction={hasActiveFilters ? handleClearFilters : fetchProducts}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1 text-xs text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-800">{products.length}</strong> products
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
