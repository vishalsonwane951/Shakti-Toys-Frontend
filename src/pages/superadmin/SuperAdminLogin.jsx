import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { superadminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await superadminLogin(email, password);
      toast.success('Welcome back!');
      navigate('/superadmin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🛠️</div>
            <h1 className="font-display text-2xl font-bold text-white">Platform Admin</h1>
            <p className="text-gray-400 mt-2 text-sm">Sign in to manage shops and subscription plans</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-gray-900 font-bold py-3.5 rounded-2xl transition-colors mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
