import { vi, describe, it, expect, beforeEach } from 'vitest';
import { classApi, type CreateClassInput } from './class.service';

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
const orgId = 'org-1';
const classItem = {
  id: 'class-1',
  organizationId: orgId,
  branchId: 'branch-1',
  courseId: 'course-1',
  name: 'Lớp A',
  code: 'CLA-01',
  teacherId: null,
  startDate: '2026-09-01',
  endDate: '2026-09-27',
  capacity: 30,
  status: 'ACTIVE',
  createdAt: '',
  updatedAt: '',
};

const baseInput: CreateClassInput = {
  branchId: 'branch-1',
  courseId: 'course-1',
  name: 'Lớp A',
  code: 'CLA-01',
  startDate: '2026-09-01',
  endDate: '2026-09-27',
  capacity: 30,
};

describe('classApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findAll gets classes with organizationId param', async () => {
    mockedApi.get.mockResolvedValue({ data: [classItem] });
    const result = await classApi.findAll(orgId);
    expect(mockedApi.get).toHaveBeenCalledWith('/classes', {
      params: { organizationId: orgId },
    });
    expect(result).toEqual([classItem]);
  });

  it('findOne gets a single class', async () => {
    mockedApi.get.mockResolvedValue({ data: classItem });
    await classApi.findOne('class-1');
    expect(mockedApi.get).toHaveBeenCalledWith('/classes/class-1', {
      params: {},
    });
  });

  it('create posts to /classes with the payload', async () => {
    mockedApi.post.mockResolvedValue({ data: classItem });
    await classApi.create(baseInput, orgId);
    expect(mockedApi.post).toHaveBeenCalledWith('/classes', baseInput, {
      params: { organizationId: orgId },
    });
  });

  it('update patches the class with teacherId null', async () => {
    mockedApi.patch.mockResolvedValue({ data: classItem });
    await classApi.update('class-1', { teacherId: null }, orgId);
    expect(mockedApi.patch).toHaveBeenCalledWith(
      '/classes/class-1',
      { teacherId: null },
      { params: { organizationId: orgId } },
    );
  });

  it('remove deletes the class', async () => {
    mockedApi.delete.mockResolvedValue({ data: { id: 'class-1' } });
    const result = await classApi.remove('class-1');
    expect(mockedApi.delete).toHaveBeenCalledWith('/classes/class-1', {
      params: {},
    });
    expect(result).toEqual({ id: 'class-1' });
  });

  it('duplicate posts to the duplicate endpoint', async () => {
    mockedApi.post.mockResolvedValue({ data: classItem });
    await classApi.duplicate('class-1', orgId);
    expect(mockedApi.post).toHaveBeenCalledWith('/classes/class-1/duplicate', null, {
      params: { organizationId: orgId },
    });
  });
});
