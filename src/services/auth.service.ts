import api from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  async refresh(): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/refresh');
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/auth/forgot-password', {
      email,
    });
    return res.data;
  },

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<{ resetToken: string }> {
    const res = await api.post<{ resetToken: string }>('/auth/verify-otp', {
      email,
      otp,
    });
    return res.data;
  },

  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/auth/reset-password', {
      resetToken,
      newPassword,
    });
    return res.data;
  },
};