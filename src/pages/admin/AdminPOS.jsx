import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useShop } from '../../context/ShopContext';
import toast from 'react-hot-toast';

export default function AdminPOS() {
  const { currencySymbol } = useShop();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState([]); // { product, name, price, quantity, stock }
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [discountTotal, setDiscountTotal] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const searchRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const { data } = await api.get('/shop/pos/search', { params: { q } });
      setResults(data.products);
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) { toast.error('Not enough stock'); return prev; }
        return prev.map(i => i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product: product._id, name: product.name, price: product.price, quantity: 1, stock: product.stock, discount: 0 }];
    });
    setQuery('');
    setResults([]);
    searchRef.current?.focus();
  };

  const updateQty = (productId, qty) => {
    setCart(prev => prev.map(i => i.product === productId ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i));
  };

  const removeItem = (productId) => setCart(prev => prev.filter(i => i.product !== productId));

  const itemsSubtotal = cart.reduce((s, i) => s + i.price * i.quantity - (i.discount || 0), 0);
  const taxAmount = itemsSubtotal * (Number(taxPercent) / 100);
  const total = Math.max(0, itemsSubtotal - Number(discountTotal || 0) + taxAmount);
  const change = amountTendered ? Math.max(0, Number(amountTendered) - total) : 0;

  const resetSale = () => {
    setCart([]);
    setCustomer({ name: '', phone: '' });
    setAmountTendered('');
    setDiscountTotal(0);
    setTaxPercent(0);
    setPaymentMethod('Cash');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      const { data } = await api.post('/shop/pos/orders', {
        items: cart.map(i => ({ product: i.product, quantity: i.quantity, discount: i.discount || 0 })),
        customer: customer.name ? customer : undefined,
        paymentMethod,
        discountTotal: Number(discountTotal) || 0,
        taxPrice: taxAmount,
        amountTendered: amountTendered ? Number(amountTendered) : undefined
      });
      setLastOrder(data.order);
      toast.success(`Sale complete — Invoice ${data.order.invoiceNumber}`);
      resetSale();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-full">
      {/* ── Product Search & Add ── */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">POS Billing</h1>
          <p className="text-gray-400 text-sm">Scan a barcode or search by name/SKU to add items</p>
        </div>

        <div className="relative">
          <input
            ref={searchRef}
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Scan barcode or search product..."
            className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 outline-none focus:border-primary-500/50 text-base"
          />
          <AnimatePresence>
            {(results.length > 0 || searching) && query && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute z-10 top-full mt-2 w-full bg-dark-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-80 overflow-y-auto">
                {searching ? (
                  <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
                ) : results.map(p => (
                  <button
                    key={p._id}
                    onClick={() => addToCart(p)}
                    disabled={p.stock === 0}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left disabled:opacity-40"
                  >
                    <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-dark-700" onError={e => e.target.style.display = 'none'} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.sku} {p.barcode && `· ${p.barcode}`} · Stock: {p.stock}</div>
                    </div>
                    <div className="text-primary-400 font-semibold text-sm">{currencySymbol}{p.price?.toFixed(2)}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cart */}
        <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-dark-700 border-b border-white/10">
              <tr>
                {['Item', 'Price', 'Qty', 'Subtotal', ''].map(h => <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-14 text-gray-500">
                  <div className="text-4xl mb-2">🛒</div>
                  Cart is empty — search above to add items
                </td></tr>
              ) : cart.map(item => (
                <tr key={item.product} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                  <td className="px-4 py-3 text-gray-400">{currencySymbol}{item.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center bg-dark-700 rounded-lg w-fit">
                      <button onClick={() => updateQty(item.product, item.quantity - 1)} className="px-2.5 py-1 text-gray-400 hover:text-white">−</button>
                      <span className="w-8 text-center text-xs">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product, item.quantity + 1)} className="px-2.5 py-1 text-gray-400 hover:text-white">+</button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-primary-400 font-semibold">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => removeItem(item.product)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {lastOrder && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 font-semibold">Last sale: {lastOrder.invoiceNumber}</p>
                <p className="text-sm text-gray-400">Total {currencySymbol}{lastOrder.totalPrice?.toFixed(2)} • {lastOrder.paymentMethod}</p>
              </div>
              <button onClick={() => window.print()} className="text-sm bg-dark-700 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors">Print Receipt</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Checkout Panel ── */}
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-5 h-fit space-y-4 sticky top-6">
        <h3 className="font-display font-semibold text-lg">Checkout</h3>

        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Customer name (optional)" value={customer.name} onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))}
            className="col-span-2 bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500/50" />
          <input placeholder="Phone (optional)" value={customer.phone} onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))}
            className="col-span-2 bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-primary-500/50" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Discount ({currencySymbol})</label>
            <input type="number" min="0" value={discountTotal} onChange={e => setDiscountTotal(e.target.value)}
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tax (%)</label>
            <input type="number" min="0" value={taxPercent} onChange={e => setTaxPercent(e.target.value)}
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-500/50" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {['Cash', 'Card', 'UPI'].map(m => (
              <button key={m} onClick={() => setPaymentMethod(m)}
                className={`py-2 rounded-xl text-sm font-medium transition-colors ${paymentMethod === m ? 'bg-primary-500 text-dark-900' : 'bg-dark-700 text-gray-400 hover:text-white'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'Cash' && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Amount Tendered</label>
            <input type="number" min="0" value={amountTendered} onChange={e => setAmountTendered(e.target.value)}
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary-500/50" />
            {amountTendered && <p className="text-xs text-gray-400 mt-1">Change due: <span className="text-green-400 font-medium">{currencySymbol}{change.toFixed(2)}</span></p>}
          </div>
        )}

        <div className="border-t border-white/10 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span>{currencySymbol}{itemsSubtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-gray-400"><span>Discount</span><span>-{currencySymbol}{Number(discountTotal || 0).toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-gray-400"><span>Tax</span><span>{currencySymbol}{taxAmount.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
            <span>Total</span><span className="text-primary-400">{currencySymbol}{total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={placing || cart.length === 0}
          className="w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-dark-900 font-bold py-3.5 rounded-xl transition-colors"
        >
          {placing ? 'Processing...' : `Complete Sale — ${currencySymbol}${total.toFixed(2)}`}
        </button>
        {cart.length > 0 && (
          <button onClick={resetSale} className="w-full text-sm text-gray-400 hover:text-red-400 transition-colors">Clear Cart</button>
        )}
      </div>
    </div>
  );
}
