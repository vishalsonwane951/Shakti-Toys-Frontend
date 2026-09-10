import axios from 'axios';

// Uses VITE_API_URL in production (set in Netlify env vars)
// Falls back to /api proxy for local dev
const api = axios.create({
  baseURL:'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
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