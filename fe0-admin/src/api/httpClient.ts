import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const httpClient = axios.create({ baseURL });

httpClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('admin_user');
  if (stored) {
    const { token } = JSON.parse(stored) as { token?: string };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
