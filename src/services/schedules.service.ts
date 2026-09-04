import api from './api';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface Schedule {
  id: string;
  classId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleInput {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string | null;
}

export type UpdateScheduleInput = Partial<CreateScheduleInput>;

export interface CreateSessionsInput {
  sessions: CreateScheduleInput[];
}

export interface ScheduleErrorDetails {
  type?: 'class' | 'teacher' | 'internal';
  dayOfWeek?: DayOfWeek;
  dayLabel?: string;
  startTime?: string;
  endTime?: string;
  teacherName?: string;
  className?: string;
}

export interface ScheduleErrorInfo {
  message: string;
  code?: string;
  details?: ScheduleErrorDetails;
}

/**
 * Extracts the backend's nested NestJS error payload (message + optional
 * structured conflict details) from an axios rejection so the UI can render a
 * clear, user-facing explanation instead of the generic axios message.
 */
export function readScheduleError(err: unknown): ScheduleErrorInfo {
  const fallback: ScheduleErrorInfo = {
    message: 'Không thể lưu lịch học. Xin thử lại.',
  };

  if (typeof err !== 'object' || err === null) {
    return fallback;
  }

  const anyErr = err as {
    response?: {
      data?: {
        message?: unknown;
        code?: unknown;
        details?: unknown;
      };
    };
  };

  const data = anyErr.response?.data;
  if (!data) {
    return err instanceof Error ? { message: err.message } : fallback;
  }

  const message =
    typeof data.message === 'string' ? data.message : fallback.message;
  const code = typeof data.code === 'string' ? data.code : undefined;

  let details: ScheduleErrorDetails | undefined;
  if (typeof data.details === 'object' && data.details !== null) {
    details = data.details as ScheduleErrorDetails;
  }

  return { message, code, details };
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Thứ hai',
  TUESDAY: 'Thứ ba',
  WEDNESDAY: 'Thứ tư',
  THURSDAY: 'Thứ năm',
  FRIDAY: 'Thứ sáu',
  SATURDAY: 'Thứ bảy',
  SUNDAY: 'Chủ nhật',
};

export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'T2',
  TUESDAY: 'T3',
  WEDNESDAY: 'T4',
  THURSDAY: 'T5',
  FRIDAY: 'T6',
  SATURDAY: 'T7',
  SUNDAY: 'CN',
};

function params(organizationId?: string) {
  return organizationId ? { organizationId } : {};
}

export const schedulesApi = {
  async findByClass(
    classId: string,
    organizationId?: string,
  ): Promise<Schedule[]> {
    const res = await api.get<Schedule[]>(
      `/classes/${classId}/schedules`,
      { params: params(organizationId) },
    );
    return res.data;
  },

  async create(
    classId: string,
    data: CreateScheduleInput,
    organizationId?: string,
  ): Promise<Schedule> {
    const res = await api.post<Schedule>(
      `/classes/${classId}/schedules`,
      data,
      { params: params(organizationId) },
    );
    return res.data;
  },

  async createBulk(
    classId: string,
    data: CreateSessionsInput,
    organizationId?: string,
  ): Promise<Schedule[]> {
    const res = await api.post<Schedule[]>(
      `/classes/${classId}/schedules/bulk`,
      data,
      { params: params(organizationId) },
    );
    return res.data;
  },

  async update(
    id: string,
    data: UpdateScheduleInput,
    organizationId?: string,
  ): Promise<Schedule> {
    const res = await api.patch<Schedule>(`/schedules/${id}`, data, {
      params: params(organizationId),
    });
    return res.data;
  },

  async remove(id: string, organizationId?: string): Promise<void> {
    const res = await api.delete(`/schedules/${id}`, {
      params: params(organizationId),
    });
    return res.data;
  },
};