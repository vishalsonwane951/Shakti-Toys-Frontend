import { useState, useEffect, useMemo, useCallback } from 'react';
import { useShop } from './shop-context';
import { CartContext } from './cart-context';

function loadCart(storageKey) {
  try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); }
  catch { return []; }
}

// Cart is scoped per-shop so browsing multiple stores in one browser never
// mixes their items together — each shop gets its own localStorage bucket.
export function CartProvider({ children }) {
  const { shopSlug } = useShop();
  const storageKey = `cart:${shopSlug || 'default'}`;

  const [cartItems, setCartItems] = useState(() => loadCart(storageKey));

  // Track the storageKey the current cartItems belong to. If it changes
  // (active shop changed), reload from storage *during render* rather than
  // in an effect — this is React's recommended pattern for "reset state
  // when a prop changes" and avoids the extra setState-in-effect render pass.
  const [loadedKey, setLoadedKey] = useState(storageKey);
  if (storageKey !== loadedKey) {
    setLoadedKey(storageKey);
    setCartItems(loadCart(storageKey));
  }

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey]);

  // ── useCallback prevents child re-renders when parent re-renders ──
  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) {
        return prev.map(i =>
          i._id === product._id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems(prev => prev.filter(i => i._id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) {
      setCartItems(prev => prev.filter(i => i._id !== id));
      return;
    }
    setCartItems(prev => prev.map(i => i._id === id ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  // ── useMemo so totals only recalculate when cartItems actually changes ──
  const { totalItems, totalPrice } = useMemo(() => ({
    totalItems: cartItems.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
  }), [cartItems]);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart,
      updateQuantity, clearCart, totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}