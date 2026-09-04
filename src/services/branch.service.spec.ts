import { vi, describe, it, expect, beforeEach } from 'vitest';
import { branchApi } from './branch.service';

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from './api';

const mockedApi = vi.mocked(api);
const orgId = 'org-1';
const branch = {
  id: 'b-1',
  organizationId: orgId,
  name: 'Chi nhánh 1',
  code: 'CN-01',
  address: null,
  phone: null,
  status: 'active',
  createdAt: '',
  updatedAt: '',
};

describe('branchApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findAll gets branches with org param', async () => {
    mockedApi.get.mockResolvedValue({ data: [branch] });
    const result = await branchApi.findAll(orgId);
    expect(mockedApi.get).toHaveBeenCalledWith('/branches', {
      params: { organizationId: orgId },
    });
    expect(result).toEqual([branch]);
  });

  it('findOne gets a single branch without org param', async () => {
    mockedApi.get.mockResolvedValue({ data: branch });
    await branchApi.findOne('b-1');
    expect(mockedApi.get).toHaveBeenCalledWith('/branches/b-1', { params: {} });
  });

  it('create posts a branch', async () => {
    mockedApi.post.mockResolvedValue({ data: branch });
    await branchApi.create({ name: 'Chi nhánh 1', code: 'CN-01' }, orgId);
    expect(mockedApi.post).toHaveBeenCalledWith(
      '/branches',
      { name: 'Chi nhánh 1', code: 'CN-01' },
      { params: { organizationId: orgId } },
    );
  });

  it('update patches a branch', async () => {
    mockedApi.patch.mockResolvedValue({ data: branch });
    await branchApi.update('b-1', { status: 'inactive' });
    expect(mockedApi.patch).toHaveBeenCalledWith(
      '/branches/b-1',
      { status: 'inactive' },
      { params: {} },
    );
  });

  it('remove deletes a branch', async () => {
    mockedApi.delete.mockResolvedValue({ data: { id: 'b-1' } });
    await branchApi.remove('b-1', orgId);
    expect(mockedApi.delete).toHaveBeenCalledWith('/branches/b-1', {
      params: { organizationId: orgId },
    });
  });
});
