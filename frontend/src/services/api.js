import axios from 'axios';

const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const api = axios.create({ baseURL: base });

// Automatically attach token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
