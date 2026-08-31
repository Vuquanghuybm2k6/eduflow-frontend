import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  branchApi,
  type Branch,
  type BranchStatus,
  type CreateBranchInput,
} from '../../services/branch.service';
import DashboardLayout from '../../layouts/DashboardLayout';
import './BranchesPage.css';

const emptyForm = {
  name: '',
  code: '',
  address: '',
  phone: '',
  status: 'active' as BranchStatus,
};

type FormState = {
  name: string;
  code: string;
  address: string;
  phone: string;
  status: BranchStatus;
};

function BranchesPage() {
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await branchApi.findAll(organizationId);
      setBranches(data);
      setError(null);
    } catch {
      setError(
        'Không thể tải danh sách chi nhánh. Kiểm tra tổ chức (organizationId) hoặc quyền truy cập.',
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    let active = true;

    async function fetchBranches() {
      try {
        const data = await branchApi.findAll(organizationId);
        if (active) {
          setBranches(data);
          setError(null);
        }
      } catch {
        if (active) {
          setError(
            'Không thể tải danh sách chi nhánh. Kiểm tra tổ chức (organizationId) hoặc quyền truy cập.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchBranches();

    return () => {
      active = false;
    };
  }, [organizationId]);

  const stats = useMemo(() => {
    const active = branches.filter((b) => b.status === 'active').length;
    return {
      total: branches.length,
      active,
      inactive: branches.length - active,
    };
  }, [branches]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.address ?? '').toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q),
    );
  }, [branches, query]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingId(branch.id);
    setForm({
      name: branch.name,
      code: branch.code,
      address: branch.address ?? '',
      phone: branch.phone ?? '',
      status: branch.status,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim() || !form.code.trim()) {
      setFormError('Tên và mã chi nhánh là bắt buộc.');
      return;
    }

    setSaving(true);
    try {
      const payload: CreateBranchInput = {
        name: form.name.trim(),
        code: form.code.trim(),
        status: form.status,
        ...(form.address.trim() ? { address: form.address.trim() } : {}),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      };

      if (editingId) {
        await branchApi.update(editingId, payload, organizationId);
      } else {
        await branchApi.create(payload, organizationId);
      }

      setModalOpen(false);
      await load();
    } catch {
      setFormError('Lưu thất bại. Kiểm tra lại thông tin.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    setError(null);
    try {
      await branchApi.remove(deletingId, organizationId);
      setDeletingId(null);
      await load();
    } catch {
      setError('Xóa chi nhánh thất bại.');
      setDeletingId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      activeLabel="Branches"
      searchPlaceholder="Tìm kiếm chi nhánh, học viên, lớp học..."
    >
      <div className="dashboard-content branches-content">
        <div className="branches-heading">
          <div>
            <h1>Branches</h1>
            <small>Manage and organize your organization&apos;s branches</small>
          </div>
          <button className="branches-add" type="button" onClick={openCreate}>＋ Add Branch</button>
        </div>

        {error && <div className="branches-error">{error}</div>}

        <div className="branches-toolbar">
          <div className="branches-search">
            <span>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search branches..."
              aria-label="Tìm kiếm chi nhánh"
            />
          </div>
        </div>

          <section className="branches-stats">
            <article className="branches-stat">
              <div className="branches-stat-icon total">∑</div>
              <div>
                <p>Total Branches</p>
                <strong>{stats.total}</strong>
              </div>
            </article>
            <article className="branches-stat">
              <div className="branches-stat-icon active">✓</div>
              <div>
                <p>Active</p>
                <strong>{stats.active}</strong>
              </div>
            </article>
            <article className="branches-stat">
              <div className="branches-stat-icon inactive">○</div>
              <div>
                <p>Inactive</p>
                <strong>{stats.inactive}</strong>
              </div>
            </article>
          </section>

          <div className="branches-panel">
            <div className="branches-panel-title">
              <h2>Branch List</h2>
            </div>

            <table className="branches-table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Code</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="branches-empty">
                      {query
                        ? 'No branches match your search.'
                        : 'No branches yet. Click "Add Branch" to create one.'}
                    </td>
                  </tr>
                )}
                {filtered.map((branch) => (
                  <tr key={branch.id}>
                    <td>
                      <strong className="branches-branch-name">{branch.name}</strong>
                    </td>
                    <td>
                      <span className="branches-code">{branch.code}</span>
                    </td>
                    <td>{branch.address || '—'}</td>
                    <td>{branch.phone || '—'}</td>
                    <td>
                      <span
                        className={`branch-status ${
                          branch.status === 'active' ? 'active' : 'inactive'
                        }`}
                      >
                        {branch.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="branches-actions">
                      <button
                        type="button"
                        onClick={() => setViewingBranch(branch)}
                        className="action-link"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(branch)}
                        className="action-link"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(branch.id)}
                        className="action-link danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="branches-pagination">
              <span>Showing 1–{Math.max(filtered.length, 1)} of {branches.length}</span>
              <div className="branches-pagination-controls">
                <button type="button" disabled>‹</button>
                <button type="button" className="page-current">1</button>
                <button type="button" disabled>›</button>
              </div>
            </div>
          </div>
        </div>

      {modalOpen && (
        <div className="branches-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="branches-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>{editingId ? 'Edit Branch' : 'Add Branch'}</h3>
            {formError && <div className="branches-form-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <label>
                Branch name *
                <input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Hà Nội"
                />
              </label>
              <label>
                Branch code *
                <input
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value)}
                  placeholder="e.g. HN-01"
                />
              </label>
              <label>
                Address
                <input
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="e.g. 123 Trần Hưng Đạo, Hà Nội"
                />
              </label>
              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="e.g. 024 1234 5678"
                />
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) =>
                    updateField('status', e.target.value as BranchStatus)
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <div className="branches-modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div
          className="branches-modal-backdrop"
          onClick={() => setDeletingId(null)}
        >
          <div
            className="branches-modal branches-confirm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>Delete Branch</h3>
            <p>Are you sure you want to delete this branch? This action cannot be undone.</p>
            <div className="branches-modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingBranch && (
        <div
          className="branches-modal-backdrop"
          onClick={() => setViewingBranch(null)}
        >
          <div
            className="branches-modal branches-view"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>Branch Details</h3>
            <dl className="branches-view-list">
              <div>
                <dt>Name</dt>
                <dd>{viewingBranch.name}</dd>
              </div>
              <div>
                <dt>Code</dt>
                <dd>
                  <span className="branches-code">{viewingBranch.code}</span>
                </dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{viewingBranch.address || '—'}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{viewingBranch.phone || '—'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span
                    className={`branch-status ${
                      viewingBranch.status === 'active' ? 'active' : 'inactive'
                    }`}
                  >
                    {viewingBranch.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>
                  {viewingBranch.createdAt
                    ? new Date(viewingBranch.createdAt).toLocaleString('vi-VN')
                    : '—'}
                </dd>
              </div>
            </dl>
            <div className="branches-modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setViewingBranch(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default BranchesPage;
