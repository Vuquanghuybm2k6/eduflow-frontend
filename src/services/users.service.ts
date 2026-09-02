import api from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  async findAll(): Promise<User[]> {
    const res = await api.get<User[]>('/users');
    return res.data;
  },

  async findOne(id: string): Promise<User> {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
  },
};