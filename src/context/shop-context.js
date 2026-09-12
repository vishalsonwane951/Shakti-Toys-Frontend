import { createContext, useContext } from 'react';

export const ShopContext = createContext();

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (ctx === undefined) {
    throw new Error('useShop must be used within a ShopProvider — check your route tree');
  }
  return ctx;
};