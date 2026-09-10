import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending:    'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped:    'bg-purple-500/20 text-purple-400',
  delivered:  'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
};

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const { shopSlug, currencySymbol } = useShop();
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState('orders');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    api.get('/shop/orders/my')
      .then(r => setOrders(r.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', profileForm);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center text-2xl font-bold text-dark-900">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{user?.name}</h1>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10">
          {[['orders', 'My Orders'], ['profile', 'Profile']].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-primary-500 text-primary-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="font-display text-xl font-semibold mb-2">No orders yet</h3>
                <Link to={`/${shopSlug}/products`} className="text-primary-400 hover:text-primary-300 transition-colors">
                  Start shopping →
                </Link>
              </div>
            ) : (
              orders.map((order, i) => (
                // ── Fixed: added Link to order detail page ──
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/${shopSlug}/order/${order._id}`}
                    className="block bg-dark-800 border border-white/10 hover:border-primary-500/30 rounded-2xl p-5 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-700 text-gray-300'}`}>
                          {order.status}
                        </span>
                        <span className="font-bold text-primary-400">{currencySymbol}{order.totalPrice?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                      {order.orderItems.slice(0, 4).map((item, j) => (
                        <div key={j} className="w-12 h-12 rounded-lg overflow-hidden bg-dark-700 shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={e => e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=50'}
                          />
                        </div>
                      ))}
                      {order.orderItems.length > 4 && (
                        <div className="w-12 h-12 rounded-lg bg-dark-700 shrink-0 flex items-center justify-center text-xs text-gray-400">
                          +{order.orderItems.length - 4}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleProfileUpdate}
            className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-lg space-y-5"
          >
            <h2 className="font-display text-xl font-semibold">Update Profile</h2>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                required
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full bg-dark-700/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-500 hover:bg-primary-400 disabled:opacity-60 text-dark-900 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.form>
        )}

      </div>
    </div>
  );
}