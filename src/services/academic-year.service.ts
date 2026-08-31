import api from './api';

export type AcademicYearStatus = 'active' | 'inactive' | 'completed';

export interface AcademicYear {
  id: string;
  organizationId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicYearInput {
  name: string;
  startDate: string;
  endDate: string;
  status?: AcademicYearStatus;
}

export type UpdateAcademicYearInput = Partial<CreateAcademicYearInput>;

function params(organizationId?: string) {
  return organizationId ? { organizationId } : {};
}

export const academicYearApi = {
  async create(
    data: CreateAcademicYearInput,
    organizationId?: string,
  ): Promise<AcademicYear> {
    const res = await api.post<AcademicYear>('/academic-years', data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async findAll(organizationId?: string): Promise<AcademicYear[]> {
    const res = await api.get<AcademicYear[]>('/academic-years', {
      params: params(organizationId),
    });
    return res.data;
  },

  async findOne(id: string, organizationId?: string): Promise<AcademicYear> {
    const res = await api.get<AcademicYear>(`/academic-years/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },

  async update(
    id: string,
    data: UpdateAcademicYearInput,
    organizationId?: string,
  ): Promise<AcademicYear> {
    const res = await api.patch<AcademicYear>(`/academic-years/${id}`, data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async activate(id: string, organizationId?: string): Promise<AcademicYear> {
    const res = await api.patch<AcademicYear>(`/academic-years/${id}/activate`, {
      params: params(organizationId),
    });
    return res.data;
  },

  async remove(id: string, organizationId?: string): Promise<{ id: string }> {
    const res = await api.delete<{ id: string }>(`/academic-years/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },
};
