import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/LoadingSkeleton';
import { useShop } from '../context/ShopContext';

// Debounce hook — delays executing fn until user stops typing
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price',      label: 'Price: Low to High' },
  { value: '-price',     label: 'Price: High to Low' },
  { value: '-rating',    label: 'Best Rated' },
];

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const { shopSlug } = useShop();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [searchInput, setSearchInput] = useState(searchParams.get('search')   || '');
  const [category,    setCategory]    = useState(searchParams.get('category') || '');
  const [minPrice,    setMinPrice]    = useState('');
  const [maxPrice,    setMaxPrice]    = useState('');
  const [sort,        setSort]        = useState('-createdAt');
  const [page,        setPage]        = useState(1);

  // ── Debounce search — API only called 400ms after user stops typing ──
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync category filter when URL searchParams change (e.g. from nav links)
  const prevSearchParams = useRef(searchParams.toString());
  useEffect(() => {
    if (searchParams.toString() === prevSearchParams.current) return;
    prevSearchParams.current = searchParams.toString();
    setSearchInput(searchParams.get('search')   || '');
    setCategory(searchParams.get('category') || '');
    setPage(1);
  }, [searchParams]);

  // Fetch categories once
  useEffect(() => {
    if (!shopSlug) return;
    api.get(`/public/${shopSlug}/categories`)
      .then(r => setCategories(r.data?.categories || []))
      .catch(() => setCategories([]));
  }, [shopSlug]);

  // Fetch products — depends on debounced search so no call per keystroke
  useEffect(() => {
    if (!shopSlug) return;
    if (categories.length === 0 && category) return; // wait for categories before filtering

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { sort, page };
        if (debouncedSearch) params.search = debouncedSearch;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (category) {
          const cat = categories.find(c => c.slug === category);
          if (cat) params.category = cat._id;
        }
        const { data } = await api.get(`/public/${shopSlug}/products`, { params });
        setProducts(data?.products || []);
        setPagination({
          page:  data?.page  || 1,
          pages: data?.pages || 1,
          total: data?.total || 0,
        });
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch, category, minPrice, maxPrice, sort, page, categories, shopSlug]);

  const handleCategoryChange = useCallback((slug) => {
    setCategory(slug);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-8">
          <h1 className="font-display text-3xl font-bold text-white">All Products</h1>
          <p className="text-gray-400 mt-1">{pagination.total} products found</p>
        </div>

        <div className="flex gap-8">
          {/* ── Sidebar Filters ── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
                <h3 className="font-display font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left text-sm py-2 px-3 rounded-xl transition-colors ${!category ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:bg-white/5'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat._id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left text-sm py-2 px-3 rounded-xl transition-colors flex items-center gap-2 ${category === cat.slug ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                      <span>{cat.icon}</span>{cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
                <h3 className="font-display font-semibold mb-4">Price Range</h3>
                <div className="flex gap-2 items-center">
                  <input
                    type="number" placeholder="Min" value={minPrice}
                    onChange={e => { setMinPrice(e.target.value); setPage(1); }}
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-500/50"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number" placeholder="Max" value={maxPrice}
                    onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-500/50"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {/* Controlled by searchInput (instant UI update), API uses debouncedSearch */}
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={e => { setSearchInput(e.target.value); setPage(1); }}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500/50"
                />
              </div>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
                className="bg-dark-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500/50"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Products Grid — no per-card motion.div animation (reduces 20+ observers) */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">No products found</h3>
                <p className="text-gray-400">Try adjusting your filters</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {products.map(p => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary-500 text-dark-900' : 'bg-dark-800 border border-white/10 text-gray-400 hover:border-primary-500/50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}