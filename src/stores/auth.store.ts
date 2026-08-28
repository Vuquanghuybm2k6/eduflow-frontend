import { create } from 'zustand';
import { authApi, type User } from '../services/auth.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasAttemptedRestore: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  tryRestoreSession: () => Promise<boolean>;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
  hasAttemptedRestore: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login({ email, password });
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
        hasAttemptedRestore: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register(data);
      set({
        user: res.user,
        accessToken: res.accessToken,
        isAuthenticated: true,
        isLoading: false,
        hasAttemptedRestore: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  googleLogin: async (idToken) => {
    set({ isLoading: true });
    try {
      const data = await authApi.googleLogin(idToken);
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
        hasAttemptedRestore: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore error
    } finally {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        hasAttemptedRestore: true,
      });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  tryRestoreSession: async () => {
    set({ isLoading: true });
    try {
      const data = await authApi.refresh();
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
        hasAttemptedRestore: true,
      });
      return true;
    } catch {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        hasAttemptedRestore: true,
      });
      return false;
    }
  },

  setAccessToken: (token) => {
    if (token) {
      set({ accessToken: token, isAuthenticated: true });
    } else {
      set({ accessToken: null, user: null, isAuthenticated: false });
    }
  },
}));