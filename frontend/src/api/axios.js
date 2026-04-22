import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/signin') && !err.config.url.includes('/auth/signup')) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('isAdmin');
      window.location.href = '/';
    }
    if (err.response?.status === 403 && err.response?.data?.status === 'blocked') {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('isAdmin');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
