import api from './api';
import type { Student } from './students.service';
import type { StudentStatus } from './students.service';
import type { ClassItem } from './class.service';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  studentId: string;
  classId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  createdAt: string;
  student?: Student;
  class?: ClassItem;
}

export interface CreateEnrollmentInput {
  studentId: string;
  classId: string;
}

export interface ClassEnrollment {
  enrollmentId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  studentId: string;
  studentCode: string | null;
  fullName: string | null;
}

function params(organizationId?: string) {
  return organizationId ? { organizationId } : {};
}

export const enrollmentsApi = {
  async create(
    data: CreateEnrollmentInput,
    organizationId?: string,
  ): Promise<Enrollment> {
    const res = await api.post<Enrollment>('/enrollments', data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async findByClass(classId: string, organizationId?: string): Promise<Enrollment[]> {
    const res = await api.get<Enrollment[]>(`/enrollments/class/${classId}`, {
      params: params(organizationId),
    });
    return res.data;
  },

  async findByStudent(
    studentId: string,
    organizationId?: string,
  ): Promise<Enrollment[]> {
    const res = await api.get<Enrollment[]>(
      `/enrollments/student/${studentId}`,
      { params: params(organizationId) },
    );
    return res.data;
  },

  async findAll(organizationId?: string): Promise<Enrollment[]> {
    const res = await api.get<Enrollment[]>('/enrollments', {
      params: params(organizationId),
    });
    return res.data;
  },

  async findOne(id: string, organizationId?: string): Promise<Enrollment> {
    const res = await api.get<Enrollment>(`/enrollments/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },

  async updateStatus(
    id: string,
    status: EnrollmentStatus,
    organizationId?: string,
  ): Promise<Enrollment> {
    const res = await api.patch<Enrollment>(
      `/enrollments/${id}/status`,
      { status },
      { params: params(organizationId) },
    );
    return res.data;
  },

  async remove(id: string, organizationId?: string): Promise<void> {
    const res = await api.delete(`/enrollments/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },
};

export type { StudentStatus };