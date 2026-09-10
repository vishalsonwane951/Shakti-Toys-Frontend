import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  suspended: 'bg-gray-700 text-gray-300'
};

export default function SuperAdminShops() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shops, setShops] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('status') || '');
  const [assignModal, setAssignModal] = useState(null); // shop being assigned a plan
  const [assignForm, setAssignForm] = useState({ planId: '', durationDays: 30, amountPaid: '', notes: '' });
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchShops = useCallback(() => {
    setLoading(true);
    api.get('/superadmin/shops', { params: filter ? { status: filter } : {} })
      .then(r => setShops(r.data.shops))
      .catch(() => toast.error('Failed to load shops'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchShops(); }, [fetchShops]);
  useEffect(() => { api.get('/superadmin/plans').then(r => setPlans(r.data.plans.filter(p => p.isActive))).catch(() => {}); }, []);

  const handleFilterChange = (status) => {
    setFilter(status);
    setSearchParams(status ? { status } : {});
  };

  const approve = async (id) => {
    try {
      await api.put(`/superadmin/shops/${id}/approve`);
      toast.success('Shop approved!');
      fetchShops();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const reject = async () => {
    try {
      await api.put(`/superadmin/shops/${rejectModal._id}/reject`, { reason: rejectReason });
      toast.success('Shop rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchShops();
    } catch {
      toast.error('Failed');
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.put(`/superadmin/shops/${id}/toggle-active`);
      fetchShops();
    } catch {
      toast.error('Failed');
    }
  };

  const openAssign = (shop) => {
    setAssignModal(shop);
    setAssignForm({ planId: shop.subscription?.plan?._id || '', durationDays: 30, amountPaid: '', notes: '' });
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/superadmin/shops/${assignModal._id}/subscription`, assignForm);
      toast.success('Subscription assigned!');
      setAssignModal(null);
      fetchShops();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold">Shops</h1>
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => handleFilterChange(s)}
              className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${filter === s ? 'bg-orange-500 text-gray-900 font-semibold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-800 border-b border-gray-800">
            <tr>{['Shop', 'Contact', 'Status', 'Subscription', 'Registered', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : shops.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No shops found</td></tr>
            ) : shops.map(shop => (
              <tr key={shop._id} className="border-t border-gray-800">
                <td className="px-4 py-3">
                  <div className="font-medium">{shop.name}</div>
                  <div className="text-xs text-gray-500 font-mono">/{shop.slug}</div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{shop.contactEmail}<br />{shop.contactPhone}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[shop.status]}`}>{shop.status}</span>
                  {shop.status === 'approved' && !shop.isActive && <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">Suspended</span>}
                </td>
                <td className="px-4 py-3">
                  {shop.subscription?.plan ? (
                    <div>
                      <div className="text-white">{shop.subscription.plan.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{shop.subscription.status}</div>
                    </div>
                  ) : <span className="text-gray-500">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(shop.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {shop.status === 'pending' && (
                      <>
                        <button onClick={() => approve(shop._id)} className="text-xs bg-green-500/20 text-green-400 px-2.5 py-1 rounded-lg hover:bg-green-500/30 transition-colors">Approve</button>
                        <button onClick={() => setRejectModal(shop)} className="text-xs bg-red-500/20 text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-500/30 transition-colors">Reject</button>
                      </>
                    )}
                    {shop.status === 'approved' && (
                      <>
                        <button onClick={() => openAssign(shop)} className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg hover:bg-blue-500/30 transition-colors">Assign Plan</button>
                        <button onClick={() => toggleActive(shop._id)} className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${shop.isActive ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
                          {shop.isActive ? 'Suspend' : 'Reactivate'}
                        </button>
                      </>
                    )}
                    <a href={`/${shop.slug}`} target="_blank" rel="noreferrer" className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-lg hover:bg-gray-700 transition-colors">View</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setRejectModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h2 className="font-display text-lg font-bold mb-4">Reject "{rejectModal.name}"</h2>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Reason (optional, shown to owner)"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50 resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={reject} className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Confirm Reject</button>
                <button onClick={() => setRejectModal(null)} className="px-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign subscription modal */}
      <AnimatePresence>
        {assignModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setAssignModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h2 className="font-display text-lg font-bold mb-4">Assign Subscription — {assignModal.name}</h2>
              <form onSubmit={submitAssign} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Plan</label>
                  <select required value={assignForm.planId} onChange={e => setAssignForm(f => ({ ...f, planId: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50">
                    <option value="">Select plan</option>
                    {plans.map(p => <option key={p._id} value={p._id}>{p.name} — ₹{p.price}/{p.billingCycle}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Duration (days)</label>
                    <input type="number" min="1" required value={assignForm.durationDays} onChange={e => setAssignForm(f => ({ ...f, durationDays: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Amount Paid (₹)</label>
                    <input type="number" min="0" value={assignForm.amountPaid} onChange={e => setAssignForm(f => ({ ...f, amountPaid: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Notes</label>
                  <input value={assignForm.notes} onChange={e => setAssignForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Paid via bank transfer"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-400 text-gray-900 font-bold py-2.5 rounded-xl transition-colors text-sm">Assign</button>
                  <button type="button" onClick={() => setAssignModal(null)} className="px-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
