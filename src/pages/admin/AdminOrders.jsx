import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useShop } from '../../context/ShopContext';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors = {
  pending:    'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped:    'bg-purple-500/20 text-purple-400',
  delivered:  'bg-green-500/20 text-green-400',
  cancelled:  'bg-red-500/20 text-red-400',
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const { currencySymbol } = useShop();

  // useCallback — stable ref for useEffect dep array
  const fetchOrders = useCallback(() => {
    setLoading(true);
    api.get('/shop/orders/all', { params: { page } })
      .then(r => { setOrders(r.data.orders); setPages(r.data.pages); })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = useCallback(async (id, status) => {
    try {
      await api.put(`/shop/orders/${id}/status`, { status });
      toast.success('Status updated!');
      // Optimistic update — no need to re-fetch entire list
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
    } catch {
      toast.error('Failed to update status');
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <span className="text-sm text-gray-400">{orders.length} orders on this page</span>
      </div>

      <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[750px]">
          <thead className="bg-dark-700 border-b border-white/10">
            <tr>
              {['Order ID', 'Channel', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Update Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">No orders found</td></tr>
            ) : orders.map(order => (
              <tr key={order._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  #{order._id.slice(-8).toUpperCase()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.channel === 'pos' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {order.channel === 'pos' ? '🧾 POS' : '🌐 Online'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{order.user?.name || order.customer?.name || 'Walk-in'}</div>
                  <div className="text-xs text-gray-400">{order.user?.email || order.customer?.phone}</div>
                </td>
                <td className="px-4 py-3 text-gray-400">{order.orderItems?.length} items</td>
                <td className="px-4 py-3 text-primary-400 font-semibold">{currencySymbol}{order.totalPrice?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-700 text-gray-300'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {/* Optimistic update — no page reload needed */}
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    className="bg-dark-700 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-primary-500/50 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex gap-2 flex-wrap">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm transition-colors ${page === i + 1 ? 'bg-primary-500 text-dark-900' : 'bg-dark-800 border border-white/10 text-gray-400 hover:border-primary-500/50'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}