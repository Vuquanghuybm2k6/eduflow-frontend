import api from './api';

export type CourseStatus = 'active' | 'inactive';

export interface Course {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description: string | null;
  duration: number | null;
  tuitionFee: number | null;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  name: string;
  code: string;
  description?: string;
  duration?: number;
  tuitionFee?: number;
  status?: CourseStatus;
}

export type UpdateCourseInput = Partial<CreateCourseInput>;

function params(organizationId?: string) {
  return organizationId ? { organizationId } : {};
}

export const courseApi = {
  async create(
    data: CreateCourseInput,
    organizationId?: string,
  ): Promise<Course> {
    const res = await api.post<Course>('/courses', data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async findAll(organizationId?: string): Promise<Course[]> {
    const res = await api.get<Course[]>('/courses', {
      params: params(organizationId),
    });
    return res.data;
  },

  async findOne(id: string, organizationId?: string): Promise<Course> {
    const res = await api.get<Course>(`/courses/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },

  async update(
    id: string,
    data: UpdateCourseInput,
    organizationId?: string,
  ): Promise<Course> {
    const res = await api.patch<Course>(`/courses/${id}`, data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async remove(id: string, organizationId?: string): Promise<{ id: string }> {
    const res = await api.delete<{ id: string }>(`/courses/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },
};
