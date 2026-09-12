import axios from 'axios';

// Uses VITE_API_URL in production (set in Netlify env vars)
// Falls back to /api proxy for local dev
const api = axios.create({
  baseURL: 'https://store-os-backend.onrender.com/api',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Endpoints where a 401 means "wrong credentials on this attempt", not "your
// session expired" — these must NOT trigger the global logout/redirect below,
// or a simple wrong-password click ends up bouncing the user to the landing page.
const AUTH_ATTEMPT_PATHS = ['/auth/login', '/auth/superadmin-login', '/auth/register-shop'];

api.interceptors.response.use(
  res => res,
  err => {
    const isAuthAttempt = AUTH_ATTEMPT_PATHS.some(p => err.config?.url?.includes(p));
    if (err.response?.status === 401 && !isAuthAttempt) {
      let redirectTo = '/';
      try {
        const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (savedUser?.shop?.slug) redirectTo = `/${savedUser.shop.slug}/login`;
      } catch { /* ignore */ }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenVerified');
      window.location.href = redirectTo;
    }
    return Promise.reject(err);
  }
);

export default api;