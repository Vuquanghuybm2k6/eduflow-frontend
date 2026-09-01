import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';
import type { User } from './auth.service';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const SKIP_REFRESH_PATHS = ['/auth/logout', '/auth/refresh'];

// Single-flight refresh: the backend rotates (revokes) the refresh token on
// every use, so concurrent /auth/refresh calls would race and one would fail
// with 401. Deduplicate so only one request runs and the others reuse it.
let refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const { data } = await api.post<{
    user: User;
    accessToken: string;
    organizationId: string;
  }>('/auth/refresh');
  useAuthStore.setState({
    user: data.user,
    accessToken: data.accessToken,
    organizationId: data.organizationId,
    isAuthenticated: true,
    isLoading: false,
    hasAttemptedRestore: true,
  });
  return data.accessToken;
}

export function refreshSession(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

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
        const token = await refreshSession();
        originalRequest.headers.Authorization = `Bearer ${token}`;
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