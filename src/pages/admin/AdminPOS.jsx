import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useShop } from '../../context/shop-context';
import toast from 'react-hot-toast';

const PRINT_SIZES = [
  { id: 'thermal58', label: '58mm Thermal', widthMM: 58 },
  { id: 'thermal76', label: '76mm (3") Thermal', widthMM: 76 },
  { id: 'thermal80', label: '80mm Thermal', widthMM: 80 },
  { id: 'a4', label: 'A4', widthMM: 210 },
];

const UPI_TIMEOUT_SECONDS = 5 * 60;

function formatTimer(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// A visual placeholder QR pattern — there's no real UPI gateway wired up, so
// this is decorative only; the cashier confirms payment manually below it.
function FakeQRCode() {
  const cells = Array.from({ length: 49 }, (_, i) => (i * 7 + Math.floor(i / 7) * 3) % 5 < 2);
  return (
    <div className="grid grid-cols-7 gap-0.5 w-40 h-40 bg-white p-3 rounded-xl mx-auto">
      {cells.map((filled, i) => (
        <div key={i} className={filled ? 'bg-dark-900' : 'bg-white'} />
      ))}
    </div>
  );
}

function ReceiptContent({ order, shop, currencySymbol }) {
  // Fallback timestamp captured once on mount — only used when the order
  // itself has no createdAt. Avoids calling the impure Date.now() directly
  // during render.
  const [renderedAt] = useState(() => Date.now());
  const orderDate = order.createdAt || renderedAt;

  return (
    <div className="text-black font-mono text-xs leading-relaxed p-4">
      <div className="text-center mb-2">
        {shop?.logo && <img src={shop.logo} alt="" className="w-10 h-10 object-cover rounded mx-auto mb-1" />}
        <div className="font-bold text-sm">{shop?.name || 'Store'}</div>
        {shop?.address?.city && <div>{shop.address.city}{shop.address.state ? `, ${shop.address.state}` : ''}</div>}
        {shop?.contactPhone && <div>Ph: {shop.contactPhone}</div>}
        {shop?.gstNumber && <div>GSTIN: {shop.gstNumber}</div>}
      </div>
      <div className="border-t border-dashed border-black my-2" />
      <div className="flex justify-between"><span>Invoice</span><span>{order.invoiceNumber}</span></div>
      <div className="flex justify-between"><span>Date</span><span>{new Date(orderDate).toLocaleString()}</span></div>
      <div className="flex justify-between"><span>Payment</span><span>{order.paymentMethod}</span></div>
      <div className="border-t border-dashed border-black my-2" />
      {order.orderItems?.map((item, i) => (
        <div key={i} className="mb-1">
          <div className="flex justify-between"><span>{item.name}</span></div>
          <div className="flex justify-between text-[11px] text-gray-700">
            <span>{item.quantity} x {currencySymbol}{item.price?.toFixed(2)}</span>
            <span>{currencySymbol}{(item.price * item.quantity - (item.discount || 0)).toFixed(2)}</span>
          </div>
        </div>
      ))}
      <div className="border-t border-dashed border-black my-2" />
      <div className="flex justify-between"><span>Subtotal</span><span>{currencySymbol}{order.itemsPrice?.toFixed(2)}</span></div>
      {order.discountTotal > 0 && <div className="flex justify-between"><span>Discount</span><span>-{currencySymbol}{order.discountTotal?.toFixed(2)}</span></div>}
      {order.taxPrice > 0 && <div className="flex justify-between"><span>Tax</span><span>{currencySymbol}{order.taxPrice?.toFixed(2)}</span></div>}
      <div className="flex justify-between font-bold text-sm mt-1"><span>Total</span><span>{currencySymbol}{order.totalPrice?.toFixed(2)}</span></div>
      {order.amountTendered != null && (
        <>
          <div className="flex justify-between"><span>Tendered</span><span>{currencySymbol}{Number(order.amountTendered).toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Change</span><span>{currencySymbol}{Number(order.changeDue || 0).toFixed(2)}</span></div>
        </>
      )}
      <div className="border-t border-dashed border-black my-2" />
      <div className="text-center mt-2">Thank you for shopping with us!</div>
    </div>
  );
}

function ReceiptPreviewModal({ order, onClose }) {
  const { shop, currencySymbol } = useShop();
  const [size, setSize] = useState(PRINT_SIZES[2]); // default: 80mm thermal

  const handlePrint = () => {
    let styleTag = document.getElementById('pos-print-size-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'pos-print-size-style';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `@page { size: ${size.widthMM}mm auto; margin: 0; }`;
    window.print();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-white">Print Receipt</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-2 block">Paper Size</label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {PRINT_SIZES.map(s => (
              <button key={s.id} onClick={() => setSize(s)}
                className={`text-xs py-2 rounded-lg font-medium transition-colors ${size.id === s.id ? 'bg-primary-500 text-dark-900' : 'bg-dark-700 text-gray-400 hover:text-white'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-dark-900 rounded-xl p-4 flex justify-center">
          <div id="receipt-print-area" style={{ width: `${size.widthMM}mm` }} className="bg-white shadow-xl shrink-0">
            <ReceiptContent order={order} shop={shop} currencySymbol={currencySymbol} />
          </div>
        </div>

        <button onClick={handlePrint} className="w-full bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold py-3 rounded-xl transition-colors mt-4">
          Print ({size.label})
        </button>
      </motion.div>

      {/* Print-only rules: hide everything except the receipt when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-print-area, #receipt-print-area * { visibility: visible; }
          #receipt-print-area { position: fixed; top: 0; left: 0; width: ${size.widthMM}mm; }
        }
      `}</style>
    </motion.div>
  );
}

function UPIScannerModal({ total, currencySymbol, onDone, onFailed }) {
  const [secondsLeft, setSecondsLeft] = useState(UPI_TIMEOUT_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) { onFailed('timeout'); return; }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onFailed]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
        <h2 className="font-display text-lg font-bold text-white mb-1">Scan to Pay</h2>
        <p className="text-primary-400 font-bold text-2xl mb-4">{currencySymbol}{total.toFixed(2)}</p>
        <FakeQRCode />
        <p className="text-xs text-gray-500 mt-3">Demo QR — no live payment gateway connected</p>
        <div className="mt-4 text-sm text-gray-400">
          Time remaining: <span className={`font-mono font-bold ${secondsLeft < 30 ? 'text-red-400' : 'text-white'}`}>{formatTimer(secondsLeft)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button onClick={() => onFailed('manual')} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 font-semibold py-3 rounded-xl transition-colors text-sm">
            Payment Failed
          </button>
          <button onClick={onDone} className="bg-green-500 hover:bg-green-400 text-dark-900 font-bold py-3 rounded-xl transition-colors text-sm">
            Payment Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showPaymentDonePopup, setShowPaymentDonePopup] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
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

  // Actually creates the order via the API — called directly for Cash, or
  // after the cashier confirms "Payment Done" on the UPI scanner popup.
  const submitOrder = async () => {
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
      setReceiptOrder(data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    if (paymentMethod === 'UPI') {
      setShowUpiModal(true);
      return;
    }
    submitOrder();
  };

  const handleUpiDone = () => {
    setShowUpiModal(false);
    setShowPaymentDonePopup(true);
    setTimeout(async () => {
      setShowPaymentDonePopup(false);
      await submitOrder();
    }, 2000);
  };

  const handleUpiFailed = (reason) => {
    setShowUpiModal(false);
    toast.error(reason === 'timeout' ? 'UPI payment timed out.' : 'Payment marked as failed. Try again or choose another payment method.');
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
              <button onClick={() => setReceiptOrder(lastOrder)} className="text-sm bg-dark-700 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors">Print Receipt</button>
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
            {['Cash', 'Card', 'UPI'].map(m => {
              const disabled = m === 'Card';
              return (
                <button key={m} onClick={() => !disabled && setPaymentMethod(m)} disabled={disabled}
                  title={disabled ? 'Card payments are temporarily unavailable' : undefined}
                  className={`relative py-2 rounded-xl text-sm font-medium transition-colors ${
                    disabled
                      ? 'bg-dark-700/50 text-gray-600 cursor-not-allowed'
                      : paymentMethod === m ? 'bg-primary-500 text-dark-900' : 'bg-dark-700 text-gray-400 hover:text-white'
                  }`}>
                  {m}
                  {disabled && <span className="absolute -top-1.5 -right-1.5 bg-gray-600 text-[9px] text-gray-300 px-1.5 py-0.5 rounded-full">Soon</span>}
                </button>
              );
            })}
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
          onClick={handleCompleteSale}
          disabled={placing || cart.length === 0}
          className="w-full bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-dark-900 font-bold py-3.5 rounded-xl transition-colors"
        >
          {placing ? 'Processing...' : `Complete Sale — ${currencySymbol}${total.toFixed(2)}`}
        </button>
        {cart.length > 0 && (
          <button onClick={resetSale} className="w-full text-sm text-gray-400 hover:text-red-400 transition-colors">Clear Cart</button>
        )}
      </div>

      {/* UPI scanner popup */}
      <AnimatePresence>
        {showUpiModal && (
          <UPIScannerModal total={total} currencySymbol={currencySymbol} onDone={handleUpiDone} onFailed={handleUpiFailed} />
        )}
      </AnimatePresence>

      {/* Brief "payment done" confirmation before the receipt preview appears */}
      <AnimatePresence>
        {showPaymentDonePopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-dark-800 border border-green-500/30 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-3">✅</div>
              <p className="font-display text-lg font-bold text-green-400">Payment Done</p>
              <p className="text-sm text-gray-400 mt-1">Generating your receipt...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt preview + size-selectable printing */}
      <AnimatePresence>
        {receiptOrder && (
          <ReceiptPreviewModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}