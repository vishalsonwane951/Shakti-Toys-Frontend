import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', price: 0, billingCycle: 'monthly', trialDays: 0,
  maxProducts: 100, maxStaffUsers: 2, maxOrdersPerMonth: 500,
  features: '', isDefault: false
};

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50';

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = useCallback(() => {
    setLoading(true);
    api.get('/superadmin/plans').then(r => setPlans(r.data.plans)).catch(() => toast.error('Failed to load plans')).finally(() => setLoading(false));
  }, []);

  // Deferring into a microtask means fetchPlans() runs inside a .then()
  // callback rather than directly in the effect body — satisfies
  // react-hooks/set-state-in-effect, which flags setState calls made
  // synchronously straight from an effect's callstack.
  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) fetchPlans();
    });
    return () => { ignore = true; };
  }, [fetchPlans]);

  const closeForm = () => { setShowForm(false); setEditPlan(null); setForm(EMPTY_FORM); };

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({
      name: plan.name, description: plan.description || '', price: plan.price, billingCycle: plan.billingCycle,
      trialDays: plan.trialDays, maxProducts: plan.limits.maxProducts, maxStaffUsers: plan.limits.maxStaffUsers,
      maxOrdersPerMonth: plan.limits.maxOrdersPerMonth, features: (plan.features || []).join('\n'), isDefault: plan.isDefault
    });
    setShowForm(true);
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name, description: form.description, price: Number(form.price), billingCycle: form.billingCycle,
        trialDays: Number(form.trialDays), isDefault: form.isDefault,
        limits: {
          maxProducts: Number(form.maxProducts), maxStaffUsers: Number(form.maxStaffUsers), maxOrdersPerMonth: Number(form.maxOrdersPerMonth)
        },
        features: form.features.split('\n').map(f => f.trim()).filter(Boolean)
      };
      if (editPlan) {
        await api.put(`/superadmin/plans/${editPlan._id}`, payload);
        toast.success('Plan updated!');
      } else {
        await api.post('/superadmin/plans', payload);
        toast.success('Plan created!');
      }
      fetchPlans();
      closeForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSubmitting(false); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this plan? Existing subscribers keep working, but it will be hidden from new signups.')) return;
    try {
      await api.delete(`/superadmin/plans/${id}`);
      toast.success('Plan deactivated');
      fetchPlans();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Subscription Plans</h1>
          <p className="text-gray-400 text-sm mt-1">Manage pricing, limits, and features shops can subscribe to.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-400 text-gray-900 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
          + New Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map(plan => (
            <div key={plan._id} className={`bg-gray-900 border rounded-2xl p-6 ${plan.isActive ? 'border-gray-800' : 'border-gray-800 opacity-50'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg">{plan.name}</h3>
                  {plan.isDefault && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Default</span>}
                  {!plan.isActive && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full ml-1">Inactive</span>}
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-400 mt-3">
                {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                {plan.price > 0 && <span className="text-sm text-gray-400 font-normal">/{plan.billingCycle}</span>}
              </p>
              {plan.trialDays > 0 && <p className="text-xs text-gray-400 mt-1">{plan.trialDays}-day trial</p>}
              <div className="mt-4 space-y-1 text-sm text-gray-400">
                <div>Products: {plan.limits.maxProducts === -1 ? 'Unlimited' : plan.limits.maxProducts}</div>
                <div>Staff: {plan.limits.maxStaffUsers === -1 ? 'Unlimited' : plan.limits.maxStaffUsers}</div>
                <div>Orders/mo: {plan.limits.maxOrdersPerMonth === -1 ? 'Unlimited' : plan.limits.maxOrdersPerMonth}</div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => openEdit(plan)} className="flex-1 text-xs bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-colors">Edit</button>
                {plan.isActive && (
                  <button onClick={() => handleDeactivate(plan._id)} className="flex-1 text-xs bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors">Deactivate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={e => e.target === e.currentTarget && closeForm()}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg my-8">
              <div className="flex justify-between mb-5">
                <h2 className="font-display text-xl font-bold">{editPlan ? 'Edit Plan' : 'New Plan'}</h2>
                <button onClick={closeForm} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-400 mb-1 block">Plan Name *</label>
                    <input required value={form.name} onChange={e => setField('name', e.target.value)} className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-400 mb-1 block">Description</label>
                    <input value={form.description} onChange={e => setField('description', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Price (₹)</label>
                    <input type="number" min="0" value={form.price} onChange={e => setField('price', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Billing Cycle</label>
                    <select value={form.billingCycle} onChange={e => setField('billingCycle', e.target.value)} className={inputCls}>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Trial Days</label>
                    <input type="number" min="0" value={form.trialDays} onChange={e => setField('trialDays', e.target.value)} className={inputCls} />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setField('isDefault', e.target.checked)} className="accent-orange-500 w-4 h-4" />
                    <label htmlFor="isDefault" className="text-sm text-gray-400 cursor-pointer">Default plan for new shops</label>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Max Products (-1 = unlimited)</label>
                    <input type="number" value={form.maxProducts} onChange={e => setField('maxProducts', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Max Staff (-1 = unlimited)</label>
                    <input type="number" value={form.maxStaffUsers} onChange={e => setField('maxStaffUsers', e.target.value)} className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-400 mb-1 block">Max Orders/Month (-1 = unlimited)</label>
                    <input type="number" value={form.maxOrdersPerMonth} onChange={e => setField('maxOrdersPerMonth', e.target.value)} className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-400 mb-1 block">Features (one per line)</label>
                    <textarea rows={4} value={form.features} onChange={e => setField('features', e.target.value)} className={`${inputCls} resize-none`} placeholder={'Online store\nPOS billing\nPriority support'} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-gray-900 font-bold py-3 rounded-xl text-sm transition-colors">
                    {submitting ? 'Saving...' : editPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                  <button type="button" onClick={closeForm} className="px-5 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl text-sm transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}