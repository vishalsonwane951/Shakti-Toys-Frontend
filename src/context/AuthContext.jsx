import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const TOKEN_VERIFY_INTERVAL = 60 * 60 * 1000; // re-verify token max once per hour

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenVerified');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      setLoading(false);
      return;
    }

    setUser(JSON.parse(savedUser));

    const lastVerified = parseInt(localStorage.getItem('tokenVerified') || '0', 10);
    const needsVerify = Date.now() - lastVerified > TOKEN_VERIFY_INTERVAL;

    if (needsVerify) {
      api.get('/auth/me')
        .then(r => {
          setUser(r.data.user);
          localStorage.setItem('user', JSON.stringify(r.data.user));
          localStorage.setItem('tokenVerified', Date.now().toString());
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [logout]);

  const persist = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('tokenVerified', Date.now().toString());
    setUser(data.user);
  };

  // Owner/staff/customer login — always scoped to one shop
  const login = async (shopSlug, email, password) => {
    const { data } = await api.post('/auth/login', { shopSlug, email, password });
    persist(data);
    return data;
  };

  const superadminLogin = async (email, password) => {
    const { data } = await api.post('/auth/superadmin-login', { email, password });
    persist(data);
    return data;
  };

  // Customer sign-up on a specific shop's storefront
  const register = async (shopSlug, name, email, password, phone) => {
    const { data } = await api.post(`/public/${shopSlug}/register`, { name, email, password, phone });
    persist(data);
    return data;
  };

  // Staff requesting access to work at a specific shop (needs owner approval)
  const registerStaff = async (shopSlug, name, email, password, phone) => {
    const { data } = await api.post(`/public/${shopSlug}/register-staff`, { name, email, password, phone });
    persist(data);
    return data;
  };

  // New store owner sign-up — creates a brand-new shop (needs superadmin approval)
  const registerShop = async (shopName, ownerName, email, password, phone) => {
    const { data } = await api.post('/auth/register-shop', { shopName, ownerName, email, password, phone });
    persist(data);
    return data;
  };

  const refreshMe = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, superadminLogin, register, registerStaff, registerShop,
      logout, updateUser, refreshMe,
      isSuperadmin: user?.role === 'superadmin',
      isOwner: user?.role === 'owner',
      isStaff: user?.role === 'staff',
      isOwnerOrStaff: user?.role === 'owner' || user?.role === 'staff',
      isCustomer: user?.role === 'customer',
      isPending: user?.status === 'pending',
      isRejected: user?.status === 'rejected'
    }}>
      {children}
    </AuthContext.Provider>
  );
}
