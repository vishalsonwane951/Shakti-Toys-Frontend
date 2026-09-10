import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { shopSlug, brandName, logo } = useShop();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(shopSlug, form.name, form.email, form.password, form.phone);
      toast.success('Account created!');
      navigate(`/${shopSlug}`);
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
            {logo ? <img src={logo} alt={brandName} className="w-14 h-14 rounded-2xl object-cover mx-auto mb-4" /> : <div className="text-5xl mb-4">🏪</div>}
            <h1 className="font-display text-3xl font-bold">Create Account</h1>
            <p className="text-gray-400 mt-2 text-sm">Join {brandName} and start shopping</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 90000 00000', optional: true },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' }
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm text-gray-400 mb-1.5 block">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} required={!f.optional} minLength={f.key === 'password' ? 6 : undefined}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500/50" />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-60 text-dark-900 font-bold py-3.5 rounded-2xl transition-colors mt-2">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to={`/${shopSlug}/login`} className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
