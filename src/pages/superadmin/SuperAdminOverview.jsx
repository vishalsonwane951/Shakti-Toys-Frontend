import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function SuperAdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/superadmin/dashboard').then(r => setStats(r.data.stats)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { label: 'Total Shops', value: stats?.totalShops || 0, icon: '🏪', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Pending Approval', value: stats?.pendingShops || 0, icon: '⏳', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Approved Shops', value: stats?.approvedShops || 0, icon: '✅', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Active Subscriptions', value: stats?.activeSubs || 0, icon: '💳', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Total Orders (all shops)', value: stats?.totalOrders || 0, icon: '📦', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Subscription Revenue', value: `₹${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: '💰', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Platform Overview</h1>
        <p className="text-gray-400 mt-1">Across all shops on the platform</p>
      </div>

      {stats?.pendingShops > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5 flex items-center justify-between">
          <p className="text-yellow-400 font-medium">{stats.pendingShops} shop{stats.pendingShops > 1 ? 's' : ''} waiting for approval</p>
          <Link to="/superadmin/shops?status=pending" className="text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-4 py-2 rounded-xl transition-colors">Review Now</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map(card => (
          <div key={card.label} className={`bg-gray-900 border rounded-2xl p-6 ${card.bg}`}>
            <span className="text-2xl">{card.icon}</span>
            <div className={`font-display text-3xl font-bold mt-4 mb-1 ${card.color}`}>{card.value}</div>
            <div className="text-sm text-gray-400">{card.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold mb-5">Recently Registered Shops</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-gray-800 border-b border-gray-800">
              <tr>{['Shop', 'Slug', 'Status', 'Registered'].map(h => <th key={h} className="text-left px-5 py-3 text-gray-400 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {stats?.recentShops?.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No shops yet</td></tr>
              ) : stats?.recentShops?.map(s => (
                <tr key={s._id} className="border-t border-gray-800">
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">{s.slug}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${s.status === 'approved' ? 'bg-green-500/20 text-green-400' : s.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
