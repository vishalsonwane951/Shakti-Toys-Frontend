import { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useShop } from '../../context/ShopContext';

const statusColors = {
  pending:    'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped:    'bg-purple-500/20 text-purple-400',
  delivered:  'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
};

// memo — StatCard only re-renders when its own props change
const StatCard = memo(({ label, value, icon, color, bg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-dark-800 border rounded-2xl p-6 ${bg}`}
  >
    <span className="text-2xl">{icon}</span>
    <div className={`font-display text-3xl font-bold mt-4 mb-1 ${color}`}>{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </motion.div>
));
StatCard.displayName = 'StatCard';

export default function AdminOverview() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const { currencySymbol } = useShop();

  useEffect(() => {
    api.get('/shop/orders/stats')
      .then(r => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cards = [
    { label: 'Total Revenue',  value: `${currencySymbol}${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: '💰', color: 'text-green-400',   bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Online Sales',   value: `${currencySymbol}${stats?.onlineRevenue?.toFixed(2) || '0.00'}`, icon: '🌐', color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'POS (In-Store)', value: `${currencySymbol}${stats?.posRevenue?.toFixed(2) || '0.00'}`,    icon: '🧾', color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Total Orders',   value: stats?.totalOrders   || 0,                        icon: '📦', color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
    { label: 'Total Products', value: stats?.totalProducts || 0,                        icon: '🏷️', color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Customers',      value: stats?.totalUsers    || 0,                        icon: '👥', color: 'text-pink-400',    bg: 'bg-pink-500/10 border-pink-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 0.07} />
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-5">Recent Orders</h2>
        <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-dark-700 border-b border-white/10">
              <tr>
                {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No orders yet</td></tr>
              ) : stats?.recentOrders?.map((order, i) => (
                <tr key={order._id} className={`border-t border-white/5 hover:bg-white/3 transition-colors ${i % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-5 py-3 font-medium">{order.user?.name || order.customer?.name || 'Walk-in'}</td>
                  <td className="px-5 py-3 text-primary-400 font-semibold">
                    {currencySymbol}{order.totalPrice?.toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-700 text-gray-300'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}