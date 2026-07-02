import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const httpClient = axios.create({ baseURL });

httpClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('submitter_user');
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
    // Do not force /login on data API 401s — projectService falls back to demo data.
    return Promise.reject(error);
  },
);
