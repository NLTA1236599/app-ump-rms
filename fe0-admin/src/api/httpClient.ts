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
      const base = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`;
      window.location.href = `${base}login`;
    }
    const payload = error.response?.data as
      | { error?: string | { message?: string }; message?: string }
      | undefined;
    const nested = typeof payload?.error === 'object' ? payload.error?.message : undefined;
    const message =
      (typeof payload?.error === 'string' ? payload.error : nested) || payload?.message;
    if (message && error instanceof Error) {
      error.message = message;
    }
    return Promise.reject(error);
  },
);
