import { vi, describe, it, expect, beforeEach } from 'vitest';
import { studentsApi } from './students.service';

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from './api';

const mockedApi = vi.mocked(api);
const orgId = 'org-1';
const student = {
  id: 's-1',
  userId: 'u-1',
  organizationId: orgId,
  studentCode: 'HV-01',
  dateOfBirth: null,
  gender: null,
  address: null,
  status: 'ACTIVE',
  createdAt: '',
  updatedAt: '',
};

const createResult = { student, temporaryPassword: 'tmp123' };

describe('studentsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findAll gets students', async () => {
    mockedApi.get.mockResolvedValue({ data: [student] });
    const result = await studentsApi.findAll(orgId);
    expect(mockedApi.get).toHaveBeenCalledWith('/students', {
      params: { organizationId: orgId },
    });
    expect(result).toEqual([student]);
  });

  it('findMe hits /students/me', async () => {
    mockedApi.get.mockResolvedValue({ data: student });
    await studentsApi.findMe();
    expect(mockedApi.get).toHaveBeenCalledWith('/students/me', { params: {} });
  });

  it('create returns student with temporary password', async () => {
    mockedApi.post.mockResolvedValue({ data: createResult });
    const result = await studentsApi.create(
      {
        fullName: 'Trần Văn B',
        email: 'b@example.com',
        studentCode: 'HV-01',
        branchIds: ['b-1'],
      },
      orgId,
    );
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/students',
      {
        fullName: 'Trần Văn B',
        email: 'b@example.com',
        studentCode: 'HV-01',
        branchIds: ['b-1'],
      },
      { params: { organizationId: orgId } },
    );
    expect(result.temporaryPassword).toBe('tmp123');
  });

  it('updateStatus patches the status endpoint', async () => {
    mockedApi.patch.mockResolvedValue({ data: student });
    await studentsApi.updateStatus('s-1', 'INACTIVE', orgId);
    expect(mockedApi.patch).toHaveBeenCalledWith(
      '/students/s-1/status',
      { status: 'INACTIVE' },
      { params: { organizationId: orgId } },
    );
  });
});
