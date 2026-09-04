import { vi, describe, it, expect, beforeEach } from 'vitest';
import { teachersApi } from './teachers.service';

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from './api';

const mockedApi = vi.mocked(api);
const orgId = 'org-1';
const teacher = {
  id: 't-1',
  userId: 'u-1',
  organizationId: orgId,
  teacherCode: 'GV-01',
  specialization: null,
  qualification: null,
  bio: null,
  hireDate: null,
  status: 'ACTIVE',
  createdAt: '',
  updatedAt: '',
};

const createResult = { teacher, temporaryPassword: 'tmp123' };

describe('teachersApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findAll gets teachers', async () => {
    mockedApi.get.mockResolvedValue({ data: [teacher] });
    const result = await teachersApi.findAll(orgId);
    expect(mockedApi.get).toHaveBeenCalledWith('/teachers', {
      params: { organizationId: orgId },
    });
    expect(result).toEqual([teacher]);
  });

  it('findMe hits /teachers/me', async () => {
    mockedApi.get.mockResolvedValue({ data: teacher });
    await teachersApi.findMe();
    expect(mockedApi.get).toHaveBeenCalledWith('/teachers/me', { params: {} });
  });

  it('create returns teacher with temporary password', async () => {
    mockedApi.post.mockResolvedValue({ data: createResult });
    const result = await teachersApi.create(
      {
        fullName: 'Nguyễn Văn A',
        email: 'a@example.com',
        teacherCode: 'GV-01',
        branchIds: ['b-1'],
      },
      orgId,
    );
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/teachers',
      {
        fullName: 'Nguyễn Văn A',
        email: 'a@example.com',
        teacherCode: 'GV-01',
        branchIds: ['b-1'],
      },
      { params: { organizationId: orgId } },
    );
    expect(result.temporaryPassword).toBe('tmp123');
  });

  it('updateStatus patches the status endpoint', async () => {
    mockedApi.patch.mockResolvedValue({ data: teacher });
    await teachersApi.updateStatus('t-1', 'INACTIVE', orgId);
    expect(mockedApi.patch).toHaveBeenCalledWith(
      '/teachers/t-1/status',
      { status: 'INACTIVE' },
      { params: { organizationId: orgId } },
    );
  });
});
