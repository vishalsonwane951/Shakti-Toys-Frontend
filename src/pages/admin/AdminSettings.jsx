import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useShop } from '../../context/shop-context';
import toast from 'react-hot-toast';

const inputCls = 'w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary-500/50 transition-colors';

export default function AdminSettings() {
  const { refreshShop } = useShop();
  const [form, setForm] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shop/settings').then(r => {
      const s = r.data.shop;
      setForm({
        name: s.name || '', tagline: s.tagline || '', description: s.description || '',
        contactEmail: s.contactEmail || '', contactPhone: s.contactPhone || '',
        street: s.address?.street || '', city: s.address?.city || '', state: s.address?.state || '',
        zipCode: s.address?.zipCode || '', country: s.address?.country || 'India',
        currency: s.currency || 'INR', currencySymbol: s.currencySymbol || '₹',
        gstNumber: s.gstNumber || '', invoicePrefix: s.invoicePrefix || 'INV'
      });
      setLogoPreview(s.logo || '');
    }).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false));
  }, []);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('tagline', form.tagline);
      fd.append('description', form.description);
      fd.append('contactEmail', form.contactEmail);
      fd.append('contactPhone', form.contactPhone);
      fd.append('currency', form.currency);
      fd.append('currencySymbol', form.currencySymbol);
      fd.append('gstNumber', form.gstNumber);
      fd.append('invoicePrefix', form.invoicePrefix);
      fd.append('address', JSON.stringify({
        street: form.street, city: form.city, state: form.state, zipCode: form.zipCode, country: form.country
      }));
      if (logoFile) fd.append('logo', logoFile);

      await api.put('/shop/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshShop();
      toast.success('Store settings updated! Your store name is now live everywhere.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Store Settings</h1>
        <p className="text-gray-400 text-sm mt-1">This is your store's identity — the name and logo you set here appear across your storefront, admin panel, and receipts.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branding */}
        <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg">Branding</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
              {logoPreview ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" /> : <span className="text-2xl">🏪</span>}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleLogoChange}
                className="text-sm text-gray-400 file:mr-3 file:bg-primary-500/20 file:text-primary-400 file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:text-xs cursor-pointer" />
              <p className="text-xs text-gray-500 mt-1">Square image works best</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Store Name * <span className="text-primary-400">(this becomes your software's name)</span></label>
            <input required value={form.name} onChange={e => setField('name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Tagline</label>
            <input value={form.tagline} onChange={e => setField('tagline', e.target.value)} className={inputCls} placeholder="e.g. Toys, RC Cars & Gadgets" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setField('description', e.target.value)} className={`${inputCls} resize-none`} />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg">Contact & Address</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-sm text-gray-400 mb-1 block">Contact Email</label><input type="email" value={form.contactEmail} onChange={e => setField('contactEmail', e.target.value)} className={inputCls} /></div>
            <div><label className="text-sm text-gray-400 mb-1 block">Contact Phone</label><input value={form.contactPhone} onChange={e => setField('contactPhone', e.target.value)} className={inputCls} /></div>
            <div className="sm:col-span-2"><label className="text-sm text-gray-400 mb-1 block">Street Address</label><input value={form.street} onChange={e => setField('street', e.target.value)} className={inputCls} /></div>
            <div><label className="text-sm text-gray-400 mb-1 block">City</label><input value={form.city} onChange={e => setField('city', e.target.value)} className={inputCls} /></div>
            <div><label className="text-sm text-gray-400 mb-1 block">State</label><input value={form.state} onChange={e => setField('state', e.target.value)} className={inputCls} /></div>
            <div><label className="text-sm text-gray-400 mb-1 block">ZIP / PIN Code</label><input value={form.zipCode} onChange={e => setField('zipCode', e.target.value)} className={inputCls} /></div>
            <div><label className="text-sm text-gray-400 mb-1 block">Country</label><input value={form.country} onChange={e => setField('country', e.target.value)} className={inputCls} /></div>
          </div>
        </div>

        {/* Billing / invoicing */}
        <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg">Billing & Invoicing</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-sm text-gray-400 mb-1 block">Currency Code</label><input value={form.currency} onChange={e => setField('currency', e.target.value)} className={inputCls} placeholder="INR" /></div>
            <div><label className="text-sm text-gray-400 mb-1 block">Currency Symbol</label><input value={form.currencySymbol} onChange={e => setField('currencySymbol', e.target.value)} className={inputCls} placeholder="₹" /></div>
            <div><label className="text-sm text-gray-400 mb-1 block">GST / Tax Number</label><input value={form.gstNumber} onChange={e => setField('gstNumber', e.target.value)} className={inputCls} /></div>
            <div><label className="text-sm text-gray-400 mb-1 block">POS Invoice Prefix</label><input value={form.invoicePrefix} onChange={e => setField('invoicePrefix', e.target.value)} className={inputCls} placeholder="INV" /></div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="bg-primary-500 hover:bg-primary-400 disabled:opacity-60 text-dark-900 font-bold px-6 py-3 rounded-xl transition-colors">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
