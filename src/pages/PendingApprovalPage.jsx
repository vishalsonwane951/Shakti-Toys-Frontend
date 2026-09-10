import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export default function PendingApprovalPage() {
  const { user, logout, refreshMe } = useAuth();
  const { shopSlug, brandName } = useShop();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!user) navigate(`/${shopSlug}/login`);
  }, [user, shopSlug, navigate]);

  const isRejected = user?.status === 'rejected';

  const checkStatus = async () => {
    setChecking(true);
    try {
      const fresh = await refreshMe();
      if (fresh.status === 'approved') {
        navigate(['owner', 'staff'].includes(fresh.role) ? `/${shopSlug}/admin` : `/${shopSlug}`);
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="bg-dark-800 border border-white/10 rounded-3xl p-10">
          <div className="text-6xl mb-6">{isRejected ? '🚫' : '⏳'}</div>
          <h1 className="font-display text-2xl font-bold text-white mb-3">
            {isRejected ? 'Access Not Approved' : 'Awaiting Approval'}
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {isRejected
              ? `Your request to access ${brandName} was not approved. Please contact the store owner or platform support for more information.`
              : user?.role === 'owner'
                ? `Your store request for ${brandName} is being reviewed by our platform team. You'll be able to sign in as soon as it's approved.`
                : `Your request to join ${brandName} as staff is waiting for the store owner's approval.`}
          </p>
          {!isRejected && (
            <button onClick={checkStatus} disabled={checking}
              className="w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-60 text-dark-900 font-bold py-3 rounded-xl transition-colors mb-3">
              {checking ? 'Checking...' : 'Check Status'}
            </button>
          )}
          <button onClick={() => { logout(); navigate(`/${shopSlug}/login`); }}
            className="w-full text-sm text-gray-400 hover:text-white transition-colors py-2">
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
