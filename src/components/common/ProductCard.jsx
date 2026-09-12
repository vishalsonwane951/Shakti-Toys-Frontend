import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context/cart-context';
import { useShop } from '../../context/shop-context';
import toast from 'react-hot-toast';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-primary-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { shopSlug, currencySymbol } = useShop();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`, {
      style: { background: '#1a1a26', color: '#fff', border: '1px solid rgba(245,147,0,0.3)' },
      iconTheme: { primary: '#f59300', secondary: '#fff' }
    });
  };

  const img = product.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80';
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : product.discount;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Link to={`/${shopSlug}/product/${product._id}`} className="block">
        <div className="bg-dark-800 border border-white/8 rounded-2xl overflow-hidden group hover:border-primary-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-dark-700">
            <img
              src={img} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'; }}
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-{discount}%</span>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-semibold text-sm bg-black/80 px-3 py-1 rounded-full">Out of Stock</span>
              </div>
            )}
            {product.isFeatured && (
              <span className="absolute top-3 right-3 bg-primary-500 text-dark-900 text-xs font-bold px-2 py-1 rounded-full">⭐ Featured</span>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="text-xs text-primary-400 font-medium mb-1 uppercase tracking-wide">{product.category?.name || 'Uncategorized'}</div>
            <h3 className="font-display font-semibold text-sm text-white line-clamp-2 mb-2 group-hover:text-primary-300 transition-colors">{product.name}</h3>
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={product.rating} />
              <span className="text-xs text-gray-500">({product.numReviews})</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display font-bold text-lg text-white">{currencySymbol}{product.price?.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-500 line-through ml-2">{currencySymbol}{product.originalPrice?.toFixed(2)}</span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="bg-primary-500 hover:bg-primary-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-dark-900 font-semibold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
