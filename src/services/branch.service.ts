import api from './api';

export type BranchStatus = 'active' | 'inactive';

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  status: BranchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchInput {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  status?: BranchStatus;
}

export type UpdateBranchInput = Partial<CreateBranchInput>;

function params(organizationId?: string) {
  return organizationId ? { organizationId } : {};
}

export const branchApi = {
  async create(
    data: CreateBranchInput,
    organizationId?: string,
  ): Promise<Branch> {
    const res = await api.post<Branch>('/branches', data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async findAll(organizationId?: string): Promise<Branch[]> {
    const res = await api.get<Branch[]>('/branches', {
      params: params(organizationId),
    });
    return res.data;
  },

  async findOne(id: string, organizationId?: string): Promise<Branch> {
    const res = await api.get<Branch>(`/branches/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },

  async update(
    id: string,
    data: UpdateBranchInput,
    organizationId?: string,
  ): Promise<Branch> {
    const res = await api.patch<Branch>(`/branches/${id}`, data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async remove(id: string, organizationId?: string): Promise<{ id: string }> {
    const res = await api.delete<{ id: string }>(`/branches/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },
};
