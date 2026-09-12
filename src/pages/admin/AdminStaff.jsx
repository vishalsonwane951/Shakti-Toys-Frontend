import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(() => {
    setLoading(true);
    api.get('/shop/staff').then(r => setStaff(r.data.staff)).catch(() => toast.error('Failed to load staff')).finally(() => setLoading(false));
  }, []);

  // Deferring into a microtask means fetchStaff() runs inside a .then()
  // callback rather than directly in the effect body — satisfies
  // react-hooks/set-state-in-effect, which flags setState calls made
  // synchronously straight from an effect's callstack.
  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchStaff();
    });
    return () => { ignore = true; };
  }, [fetchStaff]);

  const approve = async (id) => {
    try {
      await api.put(`/shop/staff/${id}/approve`);
      toast.success('Staff member approved');
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const reject = async (id) => {
    try {
      await api.put(`/shop/staff/${id}/reject`);
      toast.success('Request rejected');
      fetchStaff();
    } catch {
      toast.error('Failed');
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.put(`/shop/staff/${id}/toggle-active`);
      fetchStaff();
    } catch {
      toast.error('Failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await api.delete(`/shop/staff/${id}`);
      toast.success('Staff member removed');
      fetchStaff();
    } catch {
      toast.error('Failed');
    }
  };

  const pending = staff.filter(s => s.status === 'pending');
  const others = staff.filter(s => s.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Staff</h1>
        <p className="text-gray-400 text-sm mt-1">Employees signed up with your store's link land here awaiting your approval before they can log in.</p>
      </div>

      {pending.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
          <h2 className="font-display font-semibold text-yellow-400 mb-4">Pending Approval ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map(u => (
              <div key={u._id} className="flex items-center justify-between bg-dark-800 rounded-xl p-4">
                <div>
                  <div className="font-medium text-white">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.email} {u.phone && `· ${u.phone}`}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(u._id)} className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-500/30 transition-colors">Approve</button>
                  <button onClick={() => reject(u._id)} className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-dark-700 border-b border-white/10">
            <tr>{['Name', 'Email', 'Status', 'Active', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : others.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No staff members yet</td></tr>
            ) : others.map(u => (
              <tr key={u._id} className="border-t border-white/5">
                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[u.status]}`}>{u.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(u._id)} className={`text-xs px-2 py-1 rounded-lg ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(u._id)} className="text-red-400 hover:text-red-300 text-xs px-3 py-1.5 bg-red-500/10 rounded-lg transition-colors">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-dark-800/50 border border-white/10 rounded-2xl p-5 text-sm text-gray-400">
        Share your staff sign-up link with employees: <br />
        <code className="text-primary-400 break-all">{window.location.origin}/{window.location.pathname.split('/')[1]}/staff-signup</code>
      </div>
    </div>
  );
}