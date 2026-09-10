import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useShop } from '../../context/ShopContext';

const statusColors = {
  active: 'bg-green-500/20 text-green-400',
  trialing: 'bg-blue-500/20 text-blue-400',
  expired: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-700 text-gray-300',
  none: 'bg-gray-700 text-gray-300'
};

export default function AdminSubscription() {
  const { currencySymbol } = useShop();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shop/settings/subscription')
      .then(r => { setSubscription(r.data.subscription); setPlans(r.data.plans); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const currentPlanId = subscription?.plan?._id;
  const daysLeft = subscription?.expiresAt ? Math.max(0, Math.ceil((new Date(subscription.expiresAt) - new Date()) / 86400000)) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Subscription</h1>
        <p className="text-gray-400 text-sm mt-1">Your current plan and available upgrades.</p>
      </div>

      <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-gray-400 text-sm">Current Plan</p>
            <p className="font-display text-2xl font-bold text-white mt-1">{subscription?.plan?.name || 'No Plan'}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${statusColors[subscription?.status] || statusColors.none}`}>
            {subscription?.status || 'none'}
          </span>
        </div>
        {daysLeft !== null && (
          <p className="text-sm text-gray-400 mt-4">
            {subscription.status === 'expired' ? 'Expired' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`} · Renews/expires on {new Date(subscription.expiresAt).toLocaleDateString()}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-3">To upgrade or renew your plan, contact the platform admin — subscriptions are activated manually.</p>
      </div>

      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Available Plans</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan._id} className={`bg-dark-800 border rounded-2xl p-5 ${currentPlanId === plan._id ? 'border-primary-500' : 'border-white/10'}`}>
              {currentPlanId === plan._id && <span className="text-xs bg-primary-500 text-dark-900 font-bold px-2 py-0.5 rounded-full">CURRENT</span>}
              <h3 className="font-display font-bold text-lg text-white mt-2">{plan.name}</h3>
              <p className="text-2xl font-bold text-primary-400 mt-1">
                {plan.price === 0 ? 'Free' : `${currencySymbol}${plan.price}`}
                {plan.price > 0 && <span className="text-sm text-gray-400 font-normal">/{plan.billingCycle}</span>}
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features?.map((f, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
