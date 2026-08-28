import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const SKIP_REFRESH_PATHS = ['/auth/logout', '/auth/refresh'];

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !SKIP_REFRESH_PATHS.includes(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post('/auth/refresh');
        useAuthStore.getState().setAccessToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;