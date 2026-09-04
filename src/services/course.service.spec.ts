import { vi, describe, it, expect, beforeEach } from 'vitest';
import { courseApi } from './course.service';

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from './api';

const mockedApi = vi.mocked(api);
const orgId = 'org-1';
const course = {
  id: 'c-1',
  organizationId: orgId,
  name: 'IELTS',
  code: 'IELTS-01',
  description: null,
  duration: null,
  tuitionFee: null,
  status: 'active',
  createdAt: '',
  updatedAt: '',
};

describe('courseApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findAll gets courses with org param', async () => {
    mockedApi.get.mockResolvedValue({ data: [course] });
    const result = await courseApi.findAll(orgId);
    expect(mockedApi.get).toHaveBeenCalledWith('/courses', {
      params: { organizationId: orgId },
    });
    expect(result).toEqual([course]);
  });

  it('findOne gets a single course', async () => {
    mockedApi.get.mockResolvedValue({ data: course });
    await courseApi.findOne('c-1');
    expect(mockedApi.get).toHaveBeenCalledWith('/courses/c-1', { params: {} });
  });

  it('create posts a course', async () => {
    mockedApi.post.mockResolvedValue({ data: course });
    await courseApi.create({ name: 'IELTS', code: 'IELTS-01' }, orgId);
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/courses',
      { name: 'IELTS', code: 'IELTS-01' },
      { params: { organizationId: orgId } },
    );
  });

  it('update patches a course', async () => {
    mockedApi.patch.mockResolvedValue({ data: course });
    await courseApi.update('c-1', { tuitionFee: 1000000 });
    expect(mockedApi.patch).toHaveBeenCalledWith(
      '/courses/c-1',
      { tuitionFee: 1000000 },
      { params: {} },
    );
  });

  it('remove deletes a course', async () => {
    mockedApi.delete.mockResolvedValue({ data: { id: 'c-1' } });
    await courseApi.remove('c-1', orgId);
    expect(mockedApi.delete).toHaveBeenCalledWith('/courses/c-1', {
      params: { organizationId: orgId },
    });
  });
});
