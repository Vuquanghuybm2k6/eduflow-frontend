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
  organizationId: string;
}

export interface MembershipOption {
  membershipId: string;
  organizationId: string;
  organizationName: string | null;
  roleName: string | null;
}

export interface MembershipSelectionResponse {
  user: User;
  memberships: MembershipOption[];
}

export type LoginResponse = AuthResponse | MembershipSelectionResponse;

export const authApi = {
  async sendRegistrationOtp(data: {
    email: string;
    password: string;
    fullName: string;
    organizationName: string;
    phone?: string;
  }): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/auth/register', data);
    return res.data;
  },

  async verifyRegistrationOtp(data: {
    email: string;
    otp: string;
    password: string;
    fullName: string;
    organizationName: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>(
      '/auth/verify-registration-otp',
      data,
    );
    return res.data;
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', data);
    return res.data;
  },

  async googleLogin(idToken: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/google', { idToken });
    return res.data;
  },

  async selectMembership(data: {
    email: string;
    password: string;
    membershipId: string;
  }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/select-membership', data);
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