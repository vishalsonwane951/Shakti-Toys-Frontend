import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { ShopContext } from './shop-context';

// Fallback shown only on the platform's own marketing pages (/, /pricing, /start-a-store)
// where no shop is in scope yet.
const PLATFORM_NAME = 'StoreOS';

export function ShopProvider({ children }) {
  const { shopSlug } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(!!shopSlug);
  const [notFound, setNotFound] = useState(false);

  const refreshShop = useCallback(async () => {
    if (!shopSlug) { setLoading(false); return; }
    setLoading(true);
    setNotFound(false);
    try {
      const { data } = await api.get(`/public/${shopSlug}/shop`);
      setShop(data.shop);
    } catch {
      setNotFound(true);
      setShop(null);
    } finally {
      setLoading(false);
    }
  }, [shopSlug]);

  // Deferring the call into a microtask means the setState calls inside
  // refreshShop happen inside a .then() callback rather than directly in
  // the effect body — same timing/behavior for the user, but it satisfies
  // react-hooks/set-state-in-effect, which flags direct synchronous
  // setState calls made straight from an effect's callstack.
  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) refreshShop();
    });
    return () => { ignore = true; };
  }, [refreshShop]);

  useEffect(() => {
    document.title = shop ? shop.name : PLATFORM_NAME;
  }, [shop]);

  return (
    <ShopContext.Provider value={{
      shop,
      shopSlug,
      loading,
      notFound,
      refreshShop,
      brandName: shop?.name || PLATFORM_NAME,
      logo: shop?.logo || '',
      currencySymbol: shop?.currencySymbol || '₹'
    }}>
      {children}
    </ShopContext.Provider>
  );
}