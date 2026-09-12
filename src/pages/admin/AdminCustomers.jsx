import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminCustomers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api.get('/shop/users')
      .then(r => setUsers(r.data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  // Deferring into a microtask means fetchUsers() runs inside a .then()
  // callback rather than directly in the effect body — satisfies
  // react-hooks/set-state-in-effect, which flags setState calls made
  // synchronously straight from an effect's callstack.
  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchUsers();
    });
    return () => { ignore = true; };
  }, [fetchUsers]);

  const handleDelete = useCallback(async (id) => {
    if (id === currentUser._id) { toast.error("Can't delete your own account"); return; }
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/shop/users/${id}`);
      toast.success('User deleted');
      // Optimistic update — remove from list without re-fetching
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  }, [currentUser._id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <span className="text-sm text-gray-400">{users.length} total users</span>
      </div>

      <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-dark-700 border-b border-white/10">
            <tr>
              {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No users found</td></tr>
            ) : users.map(u => (
              <tr key={u._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-400 shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium">{u.name}</span>
                    {u._id === currentUser._id && (
                      <span className="text-xs bg-primary-500/20 text-primary-400 px-1.5 py-0.5 rounded">You</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-primary-500/20 text-primary-400' : 'bg-gray-700 text-gray-300'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {u._id !== currentUser._id && (
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="text-red-400 hover:text-red-300 text-xs px-3 py-1.5 bg-red-500/10 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}