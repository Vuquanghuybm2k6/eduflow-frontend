import { create } from 'zustand';
import { refreshSession } from '../services/api';
import {
  authApi,
  type MembershipOption,
  type User,
} from '../services/auth.service';

interface PendingSelection {
  email: string;
  password: string;
  memberships: MembershipOption[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  organizationId: string | null;
  pendingSelection: PendingSelection | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasAttemptedRestore: boolean;

  login: (email: string, password: string) => Promise<LoginOutcome>;
  verifyRegistrationOtp: (data: {
    email: string;
    otp: string;
    password: string;
    fullName: string;
    organizationName: string;
    phone?: string;
  }) => Promise<void>;
  googleLogin: (idToken: string) => Promise<LoginOutcome>;
  selectMembership: (membershipId: string) => Promise<void>;
  cancelSelection: () => void;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  tryRestoreSession: () => Promise<boolean>;
  setAccessToken: (token: string | null) => void;
}

export type LoginOutcome = 'authenticated' | 'selection' | 'error';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  organizationId: null,
  pendingSelection: null,
  isLoading: false,
  isAuthenticated: false,
  hasAttemptedRestore: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login({ email, password });
      if ('accessToken' in data) {
        set({
          user: data.user,
          accessToken: data.accessToken,
          organizationId: data.organizationId,
          isAuthenticated: true,
          isLoading: false,
          hasAttemptedRestore: true,
        });
        return 'authenticated';
      }
      set({
        pendingSelection: {
          email,
          password,
          memberships: data.memberships,
        },
        isLoading: false,
        hasAttemptedRestore: true,
      });
      return 'selection';
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  verifyRegistrationOtp: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.verifyRegistrationOtp(data);
      set({
        user: res.user,
        accessToken: res.accessToken,
        organizationId: res.organizationId,
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
      if ('accessToken' in data) {
        set({
          user: data.user,
          accessToken: data.accessToken,
          organizationId: data.organizationId,
          isAuthenticated: true,
          isLoading: false,
          hasAttemptedRestore: true,
        });
        return 'authenticated';
      }
      set({
        pendingSelection: {
          email: data.user.email,
          password: '',
          memberships: data.memberships,
        },
        isLoading: false,
        hasAttemptedRestore: true,
      });
      return 'selection';
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  selectMembership: async (membershipId) => {
    const pending = useAuthStore.getState().pendingSelection;
    if (!pending) {
      throw new Error('No pending membership selection');
    }
    set({ isLoading: true });
    try {
      const data = await authApi.selectMembership({
        email: pending.email,
        password: pending.password,
        membershipId,
      });
      set({
        user: data.user,
        accessToken: data.accessToken,
        organizationId: data.organizationId,
        pendingSelection: null,
        isAuthenticated: true,
        isLoading: false,
        hasAttemptedRestore: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  cancelSelection: () => {
    set({ pendingSelection: null, isLoading: false });
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
        organizationId: null,
        pendingSelection: null,
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
        organizationId: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  tryRestoreSession: async () => {
    set({ isLoading: true });
    try {
      await refreshSession();
      set({ isLoading: false, hasAttemptedRestore: true });
      return true;
    } catch {
      set({
        user: null,
        accessToken: null,
        organizationId: null,
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
      set({
        accessToken: null,
        user: null,
        organizationId: null,
        isAuthenticated: false,
      });
    }
  },
}));
