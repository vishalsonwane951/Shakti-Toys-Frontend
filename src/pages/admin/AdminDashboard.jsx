import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/auth-context';
import { useShop } from '../../context/shop-context';

export default function AdminDashboard() {
  const { user, logout, isOwnerOrStaff, isOwner } = useAuth();
  const { brandName, logo, loading: shopLoading } = useShop();
  const { shopSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const base = `/${shopSlug}/admin`;
  const navItems = [
    { to: base, label: 'Dashboard', icon: '📊', exact: true },
    { to: `${base}/pos`, label: 'POS Billing', icon: '🧾' },
    { to: `${base}/products`, label: 'Products', icon: '📦' },
    { to: `${base}/categories`, label: 'Categories', icon: '📁' },
    { to: `${base}/orders`, label: 'Orders', icon: '🛒' },
    { to: `${base}/customers`, label: 'Customers', icon: '👥' },
    ...(isOwner ? [
      { to: `${base}/staff`, label: 'Staff', icon: '🧑‍💼' },
      { to: `${base}/subscription`, label: 'Subscription', icon: '💳' },
      { to: `${base}/settings`, label: 'Store Settings', icon: '⚙️' },
    ] : []),
  ];

  if (shopLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-dark-900"><div className="w-10 h-10 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin" /></div>;
  }

  if (!user || !isOwnerOrStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="font-display text-2xl font-bold mb-2">Admin Access Required</h2>
          <Link to={`/${shopSlug}/login`} className="text-primary-400 hover:text-primary-300 transition-colors">
            Sign in as owner or staff →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-dark-900">
      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-64 bg-dark-800 border-r border-white/10 flex flex-col fixed left-0 top-0 h-full z-40"
      >
        {/* Logo — mirrors this shop's own branding */}
        <div className="p-6 border-b border-white/10">
          <Link to={`/${shopSlug}`} className="flex items-center gap-2 min-w-0">
            {logo ? <img src={logo} alt={brandName} className="w-8 h-8 rounded-lg object-cover shrink-0" /> : <span className="text-2xl shrink-0">🏪</span>}
            <div className="min-w-0">
              <div className="font-display font-bold text-lg text-gradient truncate">{brandName}</div>
              <div className="text-xs text-primary-400 font-medium">Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-sm font-bold text-dark-900">
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user.role}</div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate(`/${shopSlug}/login`); }}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-red-500/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <main className="flex-1 ml-64 p-8 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}