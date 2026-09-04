import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  readScheduleError,
  DAYS_OF_WEEK,
  DAY_LABELS,
  DAY_SHORT_LABELS,
  schedulesApi,
  type DayOfWeek,
} from './schedules.service';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from './api';

const mockedApi = vi.mocked(api);

describe('DAY_LABELS / DAY_SHORT_LABELS', () => {
  it('contains a label for every day of the week', () => {
    expect(DAYS_OF_WEEK).toHaveLength(7);
    for (const day of DAYS_OF_WEEK) {
      expect(typeof DAY_LABELS[day]).toBe('string');
      expect(typeof DAY_SHORT_LABELS[day]).toBe('string');
    }
  });
});

describe('readScheduleError', () => {
  it('returns the fallback message for non-object input', () => {
    expect(readScheduleError(null)).toEqual({
      message: 'Không thể lưu lịch học. Xin thử lại.',
    });
    expect(readScheduleError('oops')).toEqual({
      message: 'Không thể lưu lịch học. Xin thử lại.',
    });
  });

  it('returns the raw error message for a plain Error without response', () => {
    expect(readScheduleError(new Error('network down'))).toEqual({
      message: 'network down',
    });
  });

  it('uses the generic axios message when there is no response data', () => {
    const axiosError = new Error('Request failed');
    (axiosError as { response?: unknown }).response = undefined;
    expect(readScheduleError(axiosError)).toEqual({ message: 'Request failed' });
  });

  it('extracts the message when data.message is a string', () => {
    const err = {
      response: { data: { message: 'Xung đột lịch học' } },
    };
    expect(readScheduleError(err).message).toBe('Xung đột lịch học');
  });

  it('uses fallback message when data.message is not a string', () => {
    const err = { response: { data: { message: ['a', 'b'] } } };
    expect(readScheduleError(err).message).toBe(
      'Không thể lưu lịch học. Xin thử lại.',
    );
  });

  it('extracts the structured conflict code and details', () => {
    const details = {
      type: 'teacher',
      dayOfWeek: 'MONDAY',
      dayLabel: 'Thứ hai',
      startTime: '19:00',
      endTime: '21:00',
      teacherName: 'Huy Vũ Quang',
      className: 'Math B',
    };
    const err = {
      response: {
        data: {
          code: 'SCHEDULE_CONFLICT',
          message: 'Xung đột',
          details,
        },
      },
    };
    const result = readScheduleError(err);
    expect(result.code).toBe('SCHEDULE_CONFLICT');
    expect(result.details).toEqual(details);
  });
});

describe('schedulesApi', () => {
  const classId = 'class-1';
  const orgId = 'org-1';
  const schedule = {
    id: 's-1',
    classId,
    dayOfWeek: 'MONDAY' as DayOfWeek,
    startTime: '18:00',
    endTime: '20:00',
    room: null,
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('findByClass calls get with class schedules path', async () => {
    mockedApi.get.mockResolvedValue({ data: [schedule] });
    const result = await schedulesApi.findByClass(classId);
    expect(mockedApi.get).toHaveBeenCalledWith(`/classes/${classId}/schedules`, {
      params: {},
    });
    expect(result).toEqual([schedule]);
  });

  it('findByClass appends organizationId param when provided', async () => {
    mockedApi.get.mockResolvedValue({ data: [] });
    await schedulesApi.findByClass(classId, orgId);
    expect(mockedApi.get).toHaveBeenCalledWith(`/classes/${classId}/schedules`, {
      params: { organizationId: orgId },
    });
  });

  it('create posts a single schedule', async () => {
    mockedApi.post.mockResolvedValue({ data: schedule });
    await schedulesApi.create(classId, {
      dayOfWeek: 'MONDAY',
      startTime: '18:00',
      endTime: '20:00',
    });
    expect(mockedApi.post).toHaveBeenCalledWith(
      `/classes/${classId}/schedules`,
      {
        dayOfWeek: 'MONDAY',
        startTime: '18:00',
        endTime: '20:00',
      },
      { params: {} },
    );
  });

  it('createBulk posts to the bulk endpoint', async () => {
    const sessions = {
      sessions: [
        { dayOfWeek: 'MONDAY' as DayOfWeek, startTime: '18:00', endTime: '20:00' },
        { dayOfWeek: 'WEDNESDAY' as DayOfWeek, startTime: '18:00', endTime: '20:00' },
      ],
    };
    mockedApi.post.mockResolvedValue({ data: [schedule, schedule] });
    const result = await schedulesApi.createBulk(classId, sessions, orgId);
    expect(mockedApi.post).toHaveBeenCalledWith(
      `/classes/${classId}/schedules/bulk`,
      sessions,
      { params: { organizationId: orgId } },
    );
    expect(result).toHaveLength(2);
  });

  it('update patches the schedule endpoint', async () => {
    mockedApi.patch.mockResolvedValue({ data: schedule });
    await schedulesApi.update('s-1', { endTime: '22:00' }, orgId);
    expect(mockedApi.patch).toHaveBeenCalledWith(
      '/schedules/s-1',
      { endTime: '22:00' },
      { params: { organizationId: orgId } },
    );
  });

  it('remove deletes the schedule endpoint', async () => {
    mockedApi.delete.mockResolvedValue({ data: undefined });
    await schedulesApi.remove('s-1');
    expect(mockedApi.delete).toHaveBeenCalledWith('/schedules/s-1', {
      params: {},
    });
  });
});
