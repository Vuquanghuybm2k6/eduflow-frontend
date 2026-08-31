import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  academicYearApi,
  type AcademicYear,
  type AcademicYearStatus,
  type CreateAcademicYearInput,
} from '../../services/academic-year.service';
import DashboardLayout from '../../layouts/DashboardLayout';
import './AcademicYearsPage.css';

const emptyForm = {
  name: '',
  startDate: '',
  endDate: '',
  status: 'active' as AcademicYearStatus,
};

type FormState = {
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
};

const statusLabels: Record<AcademicYearStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  completed: 'Completed',
};

function toDateInputValue(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatRange(startDate: string, endDate: string): string {
  const fmt = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  return `${fmt(startDate)} → ${fmt(endDate)}`;
}

function AcademicYearsPage() {
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;

  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingYear, setViewingYear] = useState<AcademicYear | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await academicYearApi.findAll(organizationId);
      setYears(data);
      setError(null);
    } catch {
      setError(
        'Không thể tải danh sách năm học. Kiểm tra quyền truy cập hoặc organizationId.',
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    let active = true;

    async function fetchYears() {
      try {
        const data = await academicYearApi.findAll(organizationId);
        if (active) {
          setYears(data);
          setError(null);
        }
      } catch {
        if (active) {
          setError(
            'Không thể tải danh sách năm học. Kiểm tra quyền truy cập hoặc organizationId.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchYears();

    return () => {
      active = false;
    };
  }, [organizationId]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (year: AcademicYear) => {
    setEditingId(year.id);
    setForm({
      name: year.name,
      startDate: toDateInputValue(year.startDate),
      endDate: toDateInputValue(year.endDate),
      status: year.status,
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

    if (!form.name.trim() || !form.startDate || !form.endDate) {
      setFormError('Tên, ngày bắt đầu và ngày kết thúc là bắt buộc.');
      return;
    }

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setFormError('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    setSaving(true);
    try {
      const payload: CreateAcademicYearInput = {
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
      };

      if (editingId) {
        await academicYearApi.update(editingId, payload, organizationId);
      } else {
        await academicYearApi.create(payload, organizationId);
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
      await academicYearApi.remove(deletingId, organizationId);
      setDeletingId(null);
      await load();
    } catch {
      setError('Xóa năm học thất bại.');
      setDeletingId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      activeLabel="Academic Years"
      searchPlaceholder="Tìm kiếm năm học, học viên, lớp học..."
    >
      <div className="dashboard-content acy-content">
        <div className="acy-heading">
          <div>
            <h1>Academic Years</h1>
            <small>Manage the academic years of your organization</small>
          </div>
          <button className="acy-add" type="button" onClick={openCreate}>
            ＋ Create Year
          </button>
        </div>

        {error && <div className="acy-error">{error}</div>}

        {loading && <div className="acy-loading">Đang tải năm học...</div>}

        {!loading && years.length === 0 && (
          <div className="acy-empty">
            No academic years yet. Click "Create Year" to add one.
          </div>
        )}

        <div className="acy-list">
          {years.map((year) => (
            <article key={year.id} className="acy-card">
              <div className="acy-card-main">
                <h2>{year.name}</h2>
                <span className={`acy-status ${year.status}`}>
                  ● {statusLabels[year.status]}
                </span>
                <p className="acy-range">{formatRange(year.startDate, year.endDate)}</p>
                <div className="acy-meta">
                  {/* Placeholder: class/student counts not yet provided by the backend */}
                  <span><b>12</b> Classes</span>
                  <span><b>248</b> Students</span>
                </div>
              </div>
              <div className="acy-card-actions">
                <button type="button" className="action-link" onClick={() => setViewingYear(year)}>
                  View
                </button>
                <button type="button" className="action-link" onClick={() => openEdit(year)}>
                  Edit
                </button>
                {year.status !== 'active' && (
                  <button type="button" className="action-link danger" onClick={() => setDeletingId(year.id)}>
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="acy-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="acy-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>{editingId ? 'Edit Academic Year' : 'Create Academic Year'}</h3>
            {formError && <div className="acy-form-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <label>
                Name *
                <input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. 2026 - 2027"
                />
              </label>
              <label>
                Start Date *
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </label>
              <label>
                End Date *
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                />
              </label>
              <fieldset className="acy-status-field">
                <legend>Status</legend>
                {(['active', 'inactive', 'completed'] as AcademicYearStatus[]).map(
                  (s) => (
                    <label key={s} className="acy-radio">
                      <input
                        type="radio"
                        name="acy-status"
                        value={s}
                        checked={form.status === s}
                        onChange={() => updateField('status', s)}
                      />
                      <span>● {statusLabels[s]}</span>
                    </label>
                  ),
                )}
              </fieldset>
              <div className="acy-modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
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
        <div className="acy-modal-backdrop" onClick={() => setDeletingId(null)}>
          <div
            className="acy-modal acy-confirm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>Delete Academic Year</h3>
            <p>Are you sure you want to delete this academic year? This action cannot be undone.</p>
            <div className="acy-modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setDeletingId(null)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingYear && (
        <div className="acy-modal-backdrop" onClick={() => setViewingYear(null)}>
          <div
            className="acy-modal acy-view"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>Academic Year Details</h3>
            <dl className="acy-view-list">
              <div>
                <dt>Name</dt>
                <dd>{viewingYear.name}</dd>
              </div>
              <div>
                <dt>Period</dt>
                <dd>{formatRange(viewingYear.startDate, viewingYear.endDate)}</dd>
              </div>
              <div>
                <dt>Start Date</dt>
                <dd>{new Date(viewingYear.startDate).toLocaleDateString('en-US')}</dd>
              </div>
              <div>
                <dt>End Date</dt>
                <dd>{new Date(viewingYear.endDate).toLocaleDateString('en-US')}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={`acy-status ${viewingYear.status}`}>
                    ● {statusLabels[viewingYear.status]}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>
                  {viewingYear.createdAt
                    ? new Date(viewingYear.createdAt).toLocaleString('vi-VN')
                    : '—'}
                </dd>
              </div>
            </dl>
            <div className="acy-modal-actions">
              <button type="button" className="btn-primary" onClick={() => setViewingYear(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AcademicYearsPage;
