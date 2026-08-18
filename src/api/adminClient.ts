import axios from 'axios';

const fallbackApiUrl = window.location.hostname.includes('vercel.app')
  ? window.location.origin.replace(/:\d+$/, '')
  : 'http://localhost:5000/api';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || fallbackApiUrl;

export const adminClient = axios.create({
  baseURL: `${API_BASE_URL.replace(/\/$/, '')}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
