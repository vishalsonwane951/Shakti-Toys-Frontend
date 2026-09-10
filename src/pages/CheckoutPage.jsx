import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { shopSlug, currencySymbol } = useShop();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    street: '', city: '', state: '',
    zipCode: '', country: 'US', phone: ''
  });

  // ── Fix: navigate inside useEffect, NOT during render ──
  // Calling navigate() directly in render body causes React warnings and bugs
  useEffect(() => {
    if (cartItems.length === 0) navigate(`/${shopSlug}/cart`);
  }, [cartItems, navigate]);

  const shipping = totalPrice > 50 ? 0 : 5.99;
  const tax      = totalPrice * 0.08;
  const total    = totalPrice + shipping + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate(`/${shopSlug}/login`); return; }
    setLoading(true);
    try {
      const orderItems = cartItems.map(i => ({
        product: i._id, name: i.name,
        image: i.images?.[0] || '',
        price: i.price, quantity: i.quantity
      }));
      const { data } = await api.post('/shop/orders', {
        orderItems,
        shippingAddress: form,
        paymentMethod: 'Cash on Delivery',
        itemsPrice: totalPrice,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: total
      });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/${shopSlug}/order/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Render nothing while redirect is in-flight
  if (cartItems.length === 0) return null;

  const fields = [
    { key: 'fullName', label: 'Full Name',       placeholder: 'John Doe',          colSpan: true },
    { key: 'street',   label: 'Street Address',  placeholder: '123 Main St',       colSpan: true },
    { key: 'city',     label: 'City',             placeholder: 'New York' },
    { key: 'state',    label: 'State',            placeholder: 'NY' },
    { key: 'zipCode',  label: 'ZIP Code',         placeholder: '10001' },
    { key: 'country',  label: 'Country',          placeholder: 'US' },
    { key: 'phone',    label: 'Phone',            placeholder: '+1 555 000 0000',   colSpan: true },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-5">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {fields.map(field => (
                  <div key={field.key} className={field.colSpan ? 'sm:col-span-2' : ''}>
                    <label className="text-sm text-gray-400 mb-1.5 block">{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      required
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-4">Payment</h2>
              <div className="bg-dark-700 border border-primary-500/30 rounded-xl p-4 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                </div>
                <span className="text-sm font-medium">Cash on Delivery</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-60 text-dark-900 font-bold py-4 rounded-2xl transition-colors text-base"
            >
              {loading ? 'Placing Order...' : `Place Order — ${currencySymbol}${total.toFixed(2)}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 h-fit sticky top-24">
            <h3 className="font-display text-lg font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-5">
              {cartItems.map(item => (
                <div key={item._id} className="flex gap-3 items-center">
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-dark-700"
                    loading="lazy"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=50'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                    <div className="text-xs text-gray-400">× {item.quantity}</div>
                  </div>
                  <span className="text-sm font-semibold">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span>{currencySymbol}{totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-gray-400"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `${currencySymbol}${shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between text-sm text-gray-400"><span>Tax</span><span>{currencySymbol}{tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="text-primary-400">{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}