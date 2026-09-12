import { useState, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../context/cart-context';
import { useAuth } from '../context/auth-context';
import { useShop } from '../context/shop-context';
import LoadingSpinner from '../components/common/LoadingSkeleton';
import api from '../services/api';
import toast from 'react-hot-toast';

// memo — only re-renders when rating/interactive/onRate props change
const StarRating = memo(({ rating, interactive = false, onRate }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <button
        key={s}
        onClick={() => interactive && onRate?.(s)}
        disabled={!interactive}
        className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
      >
        <svg
          className={`w-5 h-5 ${s <= Math.round(rating) ? 'text-primary-400' : 'text-gray-600'}`}
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ))}
  </div>
));
StarRating.displayName = 'StarRating';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { shopSlug, currencySymbol } = useShop();
  const { product, loading, setProduct } = useProduct(shopSlug, id);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  if (loading) return <div className="pt-20"><LoadingSpinner /></div>;
  if (!product) return <div className="pt-24 text-center text-gray-400">Product not found</div>;

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast.success(`${product.name} added to cart!`, {
      style: { background: '#1a1a26', color: '#fff', border: '1px solid rgba(245,147,0,0.3)' }
    });
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate(`/${shopSlug}/login`); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/shop/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
      const { data } = await api.get(`/public/${shopSlug}/products/${id}`);
      setProduct(data.product);
      setReviewComment('');
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const imgs = product.images?.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop'];
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* ── Image Gallery ── */}
          <div className="space-y-4">
            <div className="aspect-square bg-dark-800 rounded-3xl overflow-hidden border border-white/10">
              <img
                src={imgs[selectedImg]}
                alt={product.name}
                className="w-full h-full object-cover"
                fetchPriority="high"
              />
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {imgs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors shrink-0 ${i === selectedImg ? 'border-primary-500' : 'border-white/10'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div>
              <span className="text-primary-400 text-sm font-medium uppercase tracking-widest">
                {product.category?.name}
              </span>
              <h1 className="font-display text-3xl font-bold text-white mt-2">{product.name}</h1>
              {product.brand && <p className="text-gray-400 mt-1">by {product.brand}</p>}
            </div>

            <div className="flex items-center gap-3">
              <StarRating rating={product.rating} />
              <span className="text-gray-400 text-sm">({product.numReviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-white">{currencySymbol}{product.price?.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-gray-500 text-xl line-through">{currencySymbol}{product.originalPrice?.toFixed(2)}</span>
                  <span className="bg-red-500/20 text-red-400 text-sm font-medium px-3 py-1 rounded-full">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-300 leading-relaxed">{product.description}</p>

            {product.specifications?.length > 0 && (
              <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
                <h3 className="font-display font-semibold mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-400">{spec.key}</span>
                      <span className="text-white font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {product.stock > 0 ? `✓ ${product.stock} in stock` : '✗ Out of stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-xl">−</button>
                  <span className="w-12 text-center font-semibold">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-xl">+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-8">Customer Reviews</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {product.reviews?.length === 0 ? (
                <p className="text-gray-400">No reviews yet. Be the first to review!</p>
              ) : (
                product.reviews.map((r, i) => (
                  <div key={i} className="bg-dark-800 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-400">
                          {r.name[0]}
                        </div>
                        <span className="font-medium">{r.name}</span>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                    <p className="text-gray-300 text-sm">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {user && (
              <form onSubmit={handleReview} className="bg-dark-800 border border-white/10 rounded-2xl p-6 space-y-4 h-fit">
                <h3 className="font-display font-semibold text-lg">Write a Review</h3>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Rating</label>
                  <StarRating rating={reviewRating} interactive onRate={setReviewRating} />
                </div>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  required rows={4}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500/50 resize-none"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-dark-900 font-bold py-3 rounded-xl transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}