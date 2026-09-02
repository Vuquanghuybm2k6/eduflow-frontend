import api from './api';
import type { User } from './users.service';
import type { Branch } from './branch.service';

export type StudentStatus = 'ACTIVE' | 'INACTIVE';
export type StudentGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Student {
  id: string;
  userId: string;
  organizationId: string;
  studentCode: string;
  dateOfBirth: string | null;
  gender: StudentGender | null;
  address: string | null;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
  branches?: Branch[];
}

export interface CreateStudentInput {
  fullName: string;
  email: string;
  phone?: string;
  studentCode: string;
  branchIds: string[];
  dateOfBirth?: string;
  gender?: StudentGender;
  address?: string;
}

export interface UpdateStudentInput {
  studentCode?: string;
  branchIds?: string[];
  dateOfBirth?: string;
  gender?: StudentGender;
  address?: string;
}

export interface CreateStudentResult {
  student: Student;
  temporaryPassword: string;
}

function params(organizationId?: string) {
  return organizationId ? { organizationId } : {};
}

export const studentsApi = {
  async create(
    data: CreateStudentInput,
    organizationId?: string,
  ): Promise<CreateStudentResult> {
    const res = await api.post<CreateStudentResult>('/students', data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async findAll(organizationId?: string): Promise<Student[]> {
    const res = await api.get<Student[]>('/students', {
      params: params(organizationId),
    });
    return res.data;
  },

  async findMe(organizationId?: string): Promise<Student> {
    const res = await api.get<Student>('/students/me', {
      params: params(organizationId),
    });
    return res.data;
  },

  async findOne(id: string, organizationId?: string): Promise<Student> {
    const res = await api.get<Student>(`/students/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },

  async update(
    id: string,
    data: UpdateStudentInput,
    organizationId?: string,
  ): Promise<Student> {
    const res = await api.patch<Student>(`/students/${id}`, data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async updateStatus(
    id: string,
    status: StudentStatus,
    organizationId?: string,
  ): Promise<Student> {
    const res = await api.patch<Student>(
      `/students/${id}/status`,
      { status },
      {
        params: params(organizationId),
      },
    );
    return res.data;
  },
};
