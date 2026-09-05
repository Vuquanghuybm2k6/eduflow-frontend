import api from './api';

export type ClassStatus = 'ACTIVE' | 'INACTIVE';

export type ClassLifecycleStatus =
  | 'UPCOMING'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ClassItem {
  id: string;
  organizationId: string;
  branchId: string;
  courseId: string;
  name: string;
  code: string;
  teacherId: string | null;
  startDate: string;
  endDate: string;
  capacity: number;
  status: ClassStatus;
  lifecycleStatus: ClassLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassInput {
  branchId: string;
  courseId: string;
  name: string;
  code: string;
  teacherId?: string | null;
  startDate: string;
  endDate: string;
  capacity: number;
}

export type UpdateClassInput = Partial<CreateClassInput> & { status?: ClassStatus };

function params(organizationId?: string) {
  return organizationId ? { organizationId } : {};
}

export const classApi = {
  async create(
    data: CreateClassInput,
    organizationId?: string,
  ): Promise<ClassItem> {
    const res = await api.post<ClassItem>('/classes', data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async findAll(organizationId?: string): Promise<ClassItem[]> {
    const res = await api.get<ClassItem[]>('/classes', {
      params: params(organizationId),
    });
    return res.data;
  },

  async findOne(id: string, organizationId?: string): Promise<ClassItem> {
    const res = await api.get<ClassItem>(`/classes/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },

  async update(
    id: string,
    data: UpdateClassInput,
    organizationId?: string,
  ): Promise<ClassItem> {
    const res = await api.patch<ClassItem>(`/classes/${id}`, data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async remove(id: string, organizationId?: string): Promise<{ id: string }> {
    const res = await api.delete<{ id: string }>(`/classes/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },

  async duplicate(id: string, organizationId?: string): Promise<ClassItem> {
    const res = await api.post<ClassItem>(`/classes/${id}/duplicate`, null, {
      params: params(organizationId),
    });
    return res.data;
  },
};