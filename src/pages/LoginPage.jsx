import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import toast from 'react-hot-toast';

const PLATFORM_ADMIN_EMAIL = 'support@storeos.app';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userPopup, setUserPopup] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const { login, logout } = useAuth();
  const { shop, shopSlug, brandName, logo } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || `/${shopSlug}`;

  // Derived directly from `shop` on every render — no effect/state needed,
  // since this is a pure function of a value we already have.
  const shopPopup = !shop ? null
    : shop.status === 'pending' ? { scope: 'shop', status: 'pending' }
    : shop.status === 'rejected' ? { scope: 'shop', status: 'rejected' }
    : shop.status === 'approved' && !shop.isActive ? { scope: 'shop', status: 'suspended' }
    : null;

  // User-scope popup (set after a login attempt) takes priority when present.
  const popup = userPopup || shopPopup;

  const shopIsLive = shop?.status === 'approved' && shop?.isActive;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await login(shopSlug, email, password);
      if (user.status === 'pending') {
        setPendingUser(user);
        setUserPopup({ scope: 'user', status: 'pending' });
      } else if (user.status === 'rejected') {
        setPendingUser(user);
        setUserPopup({ scope: 'user', status: 'rejected' });
      } else {
        toast.success('Welcome back!');
        if (['owner', 'staff'].includes(user.role)) navigate(`/${shopSlug}/admin`);
        else navigate(from);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const contactTarget = popup?.scope === 'user' && pendingUser?.role === 'staff'
    ? { label: 'the store owner', email: shop?.contactEmail || null }
    : { label: 'the platform admin', email: PLATFORM_ADMIN_EMAIL };

  const closeModal = () => {
    setUserPopup(null);
    if (popup?.scope === 'user') logout();
  };

  const popupCopy = {
    'shop-pending': {
      icon: '⏳',
      title: 'Approval Pending',
      body: `Approval is pending for ${brandName}. This store hasn't been approved by the admin yet — please check back soon, or contact the admin below.`
    },
    'shop-rejected': {
      icon: '🚫',
      title: 'Store Not Approved',
      body: `${brandName} was not approved by the admin.`
    },
    'shop-suspended': {
      icon: '⛔',
      title: 'Store Suspended',
      body: `${brandName} has been suspended. Please contact the admin for details.`
    },
    'user-pending': {
      icon: '⏳',
      title: 'Still Awaiting Approval',
      body: `Your account is not approved by admin yet. Please wait for approval, or reach out to ${contactTarget.label} if this is taking too long.`
    },
    'user-rejected': {
      icon: '🚫',
      title: 'Access Not Approved',
      body: `Your access to ${brandName} was not approved.`
    }
  };
  const copy = popup ? popupCopy[`${popup.scope}-${popup.status}`] : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="bg-dark-800 border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            {logo ? <img src={logo} alt={brandName} className="w-14 h-14 rounded-2xl object-cover mx-auto mb-4" /> : <div className="text-5xl mb-4">🏪</div>}
            <h1 className="font-display text-3xl font-bold">Welcome Back</h1>
            <p className="text-gray-400 mt-2 text-sm">Sign in to your {brandName} account</p>
          </div>

          {shop && !shopIsLive && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-5 text-sm text-yellow-400">
              This store isn't approved yet, so sign-in is disabled for now.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={!shopIsLive}
                placeholder="you@example.com"
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500/50 transition-colors disabled:opacity-50" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={!shopIsLive}
                placeholder="••••••••"
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500/50 transition-colors disabled:opacity-50" />
            </div>
            <button type="submit" disabled={loading || !shopIsLive}
              className="w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-dark-900 font-bold py-3.5 rounded-2xl transition-colors mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to={`/${shopSlug}/register`} className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Create one</Link>
          </p>
          <p className="text-center text-xs text-gray-500 mt-3">
            Work here? <Link to={`/${shopSlug}/staff-signup`} className="text-gray-400 hover:text-primary-400 transition-colors">Request staff access</Link>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {copy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && closeModal()}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-800 border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center">
              <div className="text-5xl mb-4">{copy.icon}</div>
              <h2 className="font-display text-xl font-bold mb-2">{copy.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">{copy.body}</p>
              <div className="bg-dark-700 border border-white/10 rounded-xl p-4 mb-5 text-left">
                <p className="text-xs text-gray-500 mb-1">Contact {contactTarget.label}</p>
                {contactTarget.email ? (
                  <a href={`mailto:${contactTarget.email}`} className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors break-all">
                    {contactTarget.email}
                  </a>
                ) : (
                  <p className="text-sm text-gray-300">Contact details aren't set up yet — check back soon.</p>
                )}
              </div>
              <button onClick={closeModal} className="w-full bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold py-3 rounded-xl transition-colors">
                Okay
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}