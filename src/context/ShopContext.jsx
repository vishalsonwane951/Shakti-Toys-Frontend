import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const ShopContext = createContext();

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (ctx === undefined) {
    throw new Error('useShop must be used within a ShopProvider — check your route tree');
  }
  return ctx;
};

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
    } catch (err) {
      setNotFound(true);
      setShop(null);
    } finally {
      setLoading(false);
    }
  }, [shopSlug]);

  useEffect(() => { refreshShop(); }, [refreshShop]);

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