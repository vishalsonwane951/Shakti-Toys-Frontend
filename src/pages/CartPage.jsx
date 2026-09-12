import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/cart-context';
import { useShop } from '../context/shop-context';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { shopSlug, currencySymbol } = useShop();
  const navigate = useNavigate();

  if (cartItems.length === 0) return (
    <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">🛒</div>
      <h2 className="font-display text-3xl font-bold text-white mb-3">Your cart is empty</h2>
      <p className="text-gray-400 mb-8">Start shopping to add items to your cart</p>
      <Link to={`/${shopSlug}/products`} className="bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold px-8 py-3 rounded-2xl transition-colors">
        Browse Products
      </Link>
    </div>
  );

  const shipping = totalPrice > 50 ? 0 : 5.99;
  const tax      = totalPrice * 0.08;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">
            Shopping Cart <span className="text-primary-400">({cartItems.length})</span>
          </h1>
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300 transition-colors">
            Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cartItems.map(item => (
                <motion.div
                  key={item._id}
                  layout
                  exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-800 border border-white/10 rounded-2xl p-5 flex items-center gap-5"
                >
                  <Link to={`/${shopSlug}/product/${item._id}`} className="w-20 h-20 rounded-xl overflow-hidden bg-dark-700 shrink-0">
                    <img
                      src={item.images?.[0] || ''}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100'}
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/${shopSlug}/product/${item._id}`} className="font-semibold text-white hover:text-primary-400 transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-400 mt-0.5">{item.category?.name}</p>
                    <p className="text-primary-400 font-bold mt-1">{currencySymbol}{item.price?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center bg-dark-700 rounded-xl overflow-hidden">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">−</button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">+</button>
                  </div>
                  <div className="text-right min-w-16">
                    <div className="font-bold text-white">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</div>
                    <button onClick={() => removeFromCart(item._id)} className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors">
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 h-fit sticky top-24">
            <h3 className="font-display text-xl font-bold mb-6">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>{currencySymbol}{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className={shipping === 0 ? 'text-green-400' : ''}>
                  {shipping === 0 ? 'FREE' : `${currencySymbol}${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tax (8%)</span>
                <span>{currencySymbol}{tax.toFixed(2)}</span>
              </div>
              {totalPrice < 50 && (
                <p className="text-xs text-primary-400">
                  Add {currencySymbol}{(50 - totalPrice).toFixed(2)} more for free shipping!
                </p>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-400">{currencySymbol}{(totalPrice + shipping + tax).toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/${shopSlug}/checkout`)}
              className="w-full bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold py-3.5 rounded-2xl transition-colors"
            >
              Proceed to Checkout
            </button>
            <Link to={`/${shopSlug}/products`} className="block text-center text-sm text-gray-400 hover:text-gray-300 mt-3 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}