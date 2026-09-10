import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useShop } from '../../context/ShopContext';

export default function Navbar() {
  const { user, logout, isOwnerOrStaff } = useAuth();
  const { totalItems } = useCart();
  const { shop, shopSlug, brandName, logo } = useShop();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/${shopSlug}/products?search=${encodeURIComponent(search)}`); setSearch(''); }
  };

  const navLinks = [
    { to: `/${shopSlug}`, label: 'Home' },
    { to: `/${shopSlug}/products`, label: 'All Products' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }} animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-dark-900/95 backdrop-blur-xl shadow-2xl shadow-black/50' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo — driven entirely by the shop's own branding */}
          <Link to={`/${shopSlug}`} className="flex items-center gap-2 min-w-0">
            {logo ? (
              <img src={logo} alt={brandName} className="w-8 h-8 rounded-lg object-cover shrink-0" />
            ) : (
              <span className="text-2xl shrink-0">🏪</span>
            )}
            <span className="font-display font-bold text-xl text-gradient truncate">{brandName}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className="text-sm text-gray-300 hover:text-primary-400 transition-colors font-medium">{l.label}</Link>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-dark-700 border border-white/10 rounded-full px-4 py-2 gap-2 w-72">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..." className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to={`/${shopSlug}/cart`} className="relative p-2 text-gray-300 hover:text-primary-400 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{totalItems}</span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 bg-dark-700 border border-white/10 rounded-full px-3 py-1.5 hover:border-primary-500/50 transition-all">
                  <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-sm font-bold text-dark-900">{user.name[0].toUpperCase()}</div>
                  <span className="text-sm text-gray-300 hidden sm:block">{user.name.split(' ')[0]}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-dark-700 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                      <Link to={`/${shopSlug}/dashboard`} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Dashboard
                      </Link>
                      {isOwnerOrStaff && (
                        <Link to={`/${shopSlug}/admin`} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-primary-400 hover:bg-white/5 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Admin Panel
                        </Link>
                      )}
                      <button onClick={() => { logout(); setUserMenuOpen(false); navigate(`/${shopSlug}`); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to={`/${shopSlug}/login`} className="bg-primary-500 hover:bg-primary-400 text-dark-900 font-semibold text-sm px-4 py-2 rounded-full transition-colors">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-gray-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-white/10 py-4">
              <form onSubmit={handleSearch} className="flex items-center bg-dark-700 border border-white/10 rounded-full px-4 py-2 gap-2 mb-4">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1" />
              </form>
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block py-2.5 text-gray-300 hover:text-primary-400 transition-colors">{l.label}</Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
