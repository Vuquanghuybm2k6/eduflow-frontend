import api from './api';
import type { User } from './users.service';
import type { Branch } from './branch.service';

export type TeacherStatus = 'ACTIVE' | 'INACTIVE';

export interface Teacher {
  id: string;
  userId: string;
  organizationId: string;
  teacherCode: string;
  specialization: string | null;
  qualification: string | null;
  bio: string | null;
  hireDate: string | null;
  status: TeacherStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
  branches?: Branch[];
}

export interface CreateTeacherInput {
  fullName: string;
  email: string;
  phone?: string;
  teacherCode: string;
  branchIds: string[];
  specialization?: string;
  qualification?: string;
  bio?: string;
  hireDate?: string;
}

export interface UpdateTeacherInput {
  teacherCode?: string;
  branchIds?: string[];
  specialization?: string;
  qualification?: string;
  bio?: string;
  hireDate?: string;
}

export interface CreateTeacherResult {
  teacher: Teacher;
  temporaryPassword: string;
}

function params(organizationId?: string) {
  return organizationId ? { organizationId } : {};
}

export const teachersApi = {
  async create(
    data: CreateTeacherInput,
    organizationId?: string,
  ): Promise<CreateTeacherResult> {
    const res = await api.post<CreateTeacherResult>('/teachers', data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async findAll(organizationId?: string): Promise<Teacher[]> {
    const res = await api.get<Teacher[]>('/teachers', {
      params: params(organizationId),
    });
    return res.data;
  },

  async findMe(organizationId?: string): Promise<Teacher> {
    const res = await api.get<Teacher>('/teachers/me', {
      params: params(organizationId),
    });
    return res.data;
  },

  async findOne(id: string, organizationId?: string): Promise<Teacher> {
    const res = await api.get<Teacher>(`/teachers/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },

  async update(
    id: string,
    data: UpdateTeacherInput,
    organizationId?: string,
  ): Promise<Teacher> {
    const res = await api.patch<Teacher>(`/teachers/${id}`, data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async updateStatus(
    id: string,
    status: TeacherStatus,
    organizationId?: string,
  ): Promise<Teacher> {
    const res = await api.patch<Teacher>(
      `/teachers/${id}/status`,
      { status },
      {
        params: params(organizationId),
      },
    );
    return res.data;
  },
};