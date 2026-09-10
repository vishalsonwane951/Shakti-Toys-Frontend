import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function LandingPage() {
  const [plans, setPlans] = useState([]);
  const [showLoginFinder, setShowLoginFinder] = useState(false);
  const [slugInput, setSlugInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'StoreOS — Online Store + POS Billing for Every Shop';
    api.get('/public/plans').then(r => setPlans(r.data.plans)).catch(() => {});
  }, []);

  const slugify = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const goToShopLogin = (e) => {
    e.preventDefault();
    const slug = slugify(slugInput);
    if (!slug) return;
    navigate(`/${slug}/login`);
  };

  const features = [
    { icon: '🌐', title: 'Online Storefront', desc: 'A beautiful, ready-to-use online store for every shop — no design or dev work needed.' },
    { icon: '🧾', title: 'In-Store POS Billing', desc: 'Ring up in-person sales with barcode search, invoices, and shared inventory with your online store.' },
    { icon: '🏪', title: 'Your Own Branding', desc: 'Set your store name and logo once — it becomes your storefront, admin panel, and receipts everywhere.' },
    { icon: '👥', title: 'Staff Accounts', desc: 'Invite employees to help run your store, with owner-controlled approval and access.' },
    { icon: '💳', title: 'Flexible Plans', desc: 'Start free, upgrade as you grow. Plans scale with your product catalog and team size.' },
    { icon: '🔒', title: 'Your Data, Isolated', desc: 'Every store\'s products, orders, and customers are fully separated and secure.' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Nav */}
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="text-2xl">🏪</span> StoreOS
          </div>
          <div className="flex items-center gap-4">
            <Link to="/superadmin/login" className="text-sm text-gray-400 hover:text-white transition-colors">Platform Admin</Link>
            <button onClick={() => setShowLoginFinder(true)} className="text-sm text-gray-300 hover:text-white transition-colors font-medium">
              Shop Login
            </button>
            <Link to="/start-a-store" className="bg-primary-500 hover:bg-primary-400 text-dark-900 font-semibold text-sm px-4 py-2 rounded-full transition-colors">
              Start Your Store
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl sm:text-5xl font-bold leading-tight">
          One platform for your <span className="text-gradient">online store</span> and <span className="text-gradient">in-store billing</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
          StoreOS gives every shop owner their own branded storefront, a POS billing screen for the counter, and one shared product catalog — all set up in minutes.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10 flex items-center justify-center gap-4">
          <Link to="/start-a-store" className="bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold px-8 py-3.5 rounded-2xl transition-colors">
            Start Your Store — Free
          </Link>
          <button onClick={() => setShowLoginFinder(true)} className="border border-white/15 hover:border-white/30 text-white font-medium px-8 py-3.5 rounded-2xl transition-colors">
            Shop Login
          </button>
        </motion.div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-dark-800 border border-white/10 rounded-2xl p-6">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-display font-semibold text-lg mt-4 mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      {plans.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl font-bold text-center mb-10">Simple, transparent pricing</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan._id} className={`bg-dark-800 border rounded-2xl p-6 ${plan.isDefault ? 'border-primary-500' : 'border-white/10'}`}>
                {plan.isDefault && <span className="text-xs bg-primary-500 text-dark-900 font-bold px-2 py-0.5 rounded-full">POPULAR</span>}
                <h3 className="font-display font-bold text-xl mt-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                <p className="text-3xl font-bold text-primary-400 mt-4">
                  {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  {plan.price > 0 && <span className="text-sm text-gray-400 font-normal">/{plan.billingCycle}</span>}
                </p>
                {plan.trialDays > 0 && <p className="text-xs text-primary-400 mt-1">{plan.trialDays}-day free trial</p>}
                <ul className="mt-5 space-y-2">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2"><span className="text-green-400 mt-0.5">✓</span>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="border-t border-white/10 py-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} StoreOS. All rights reserved.
      </footer>

      {/* Shop Login finder modal — asks for the store link, then routes to that store's login page */}
      <AnimatePresence>
        {showLoginFinder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowLoginFinder(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-800 border border-white/10 rounded-3xl p-8 w-full max-w-sm">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🏪</div>
                <h2 className="font-display text-xl font-bold">Log in to your shop</h2>
                <p className="text-gray-400 text-sm mt-2">Enter your store's link to continue to its login page.</p>
              </div>
              <form onSubmit={goToShopLogin} className="space-y-4">
                <div className="flex items-center bg-dark-700 border border-white/10 rounded-xl overflow-hidden focus-within:border-primary-500/50 transition-colors">
                  <span className="pl-3 text-gray-500 text-sm">storeos.app/</span>
                  <input
                    autoFocus
                    value={slugInput}
                    onChange={e => setSlugInput(e.target.value)}
                    placeholder="your-store-name"
                    className="flex-1 bg-transparent px-2 py-3 text-sm text-white placeholder-gray-500 outline-none min-w-0"
                  />
                </div>
                <button type="submit" disabled={!slugInput.trim()}
                  className="w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-dark-900 font-bold py-3 rounded-xl transition-colors">
                  Continue
                </button>
              </form>
              <p className="text-center text-xs text-gray-500 mt-5">
                Don't have a store yet?{' '}
                <Link to="/start-a-store" onClick={() => setShowLoginFinder(false)} className="text-primary-400 hover:text-primary-300 transition-colors">Start one free</Link>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
