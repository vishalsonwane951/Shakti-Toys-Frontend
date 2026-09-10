import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ShopRegisterPage() {
  const [form, setForm] = useState({ shopName: '', ownerName: '', email: '', password: '', confirm: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { registerShop } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { user } = await registerShop(form.shopName, form.ownerName, form.email, form.password, form.phone);
      toast.success('Store request submitted!');
      navigate(`/${user.shop.slug}/pending-approval`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="bg-dark-800 border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🚀</div>
            <h1 className="font-display text-3xl font-bold">Start Your Store</h1>
            <p className="text-gray-400 mt-2 text-sm">Set up your own online store + POS billing system. Approval usually takes less than a day.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'shopName', label: 'Store Name', type: 'text', placeholder: 'e.g. Shakti Toys' },
              { key: 'ownerName', label: 'Your Full Name', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 90000 00000' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' }
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm text-gray-400 mb-1.5 block">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} required minLength={f.key === 'password' ? 6 : undefined}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500/50" />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-60 text-dark-900 font-bold py-3.5 rounded-2xl transition-colors mt-2">
              {loading ? 'Submitting...' : 'Create My Store'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Already run a store here? <Link to="/" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Go to homepage</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
