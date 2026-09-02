import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  classApi,
  type ClassItem,
  type ClassStatus,
  type CreateClassInput,
} from '../../services/class.service';
import { branchApi, type Branch } from '../../services/branch.service';
import { courseApi, type Course } from '../../services/course.service';
import { teachersApi, type Teacher } from '../../services/teachers.service';
import DashboardLayout from '../../layouts/DashboardLayout';
import './ClassesPage.css';

const PAGE_SIZE = 10;

const statusLabels: Record<ClassStatus, string> = {
  UPCOMING: 'Upcoming',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const emptyForm = {
  name: '',
  code: '',
  courseId: '',
  branchId: '',
  teacherId: '',
  startDate: '',
  endDate: '',
  capacity: '30',
};

type FormState = typeof emptyForm;

function ClassesPage() {
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;
  const navigate = useNavigate();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const branchMap = useMemo(() => {
    const m = new Map<string, Branch>();
    branches.forEach((b) => m.set(b.id, b));
    return m;
  }, [branches]);

  const courseMap = useMemo(() => {
    const m = new Map<string, Course>();
    courses.forEach((c) => m.set(c.id, c));
    return m;
  }, [courses]);

  const teacherMap = useMemo(() => {
    const m = new Map<string, Teacher>();
    teachers.forEach((t) => m.set(t.id, t));
    return m;
  }, [teachers]);

  const loadAll = useCallback(async () => {
    try {
      const [c, b, co, t] = await Promise.all([
        classApi.findAll(organizationId),
        branchApi.findAll(organizationId),
        courseApi.findAll(organizationId),
        teachersApi.findAll(organizationId),
      ]);
      setClasses(c);
      setBranches(b);
      setCourses(co);
      setTeachers(t);
      setError(null);
    } catch {
      setError('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (active) await loadAll();
    })();
    return () => { active = false; };
  }, [loadAll]);

  const filtered = useMemo(() => {
    let result = classes;
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q),
      );
    }
    if (filterBranch) result = result.filter((c) => c.branchId === filterBranch);
    if (filterCourse) result = result.filter((c) => c.courseId === filterCourse);
    if (filterStatus) result = result.filter((c) => c.status === filterStatus);
    return result;
  }, [classes, query, filterBranch, filterCourse, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  useEffect(() => {
    setPage(1);
  }, [query, filterBranch, filterCourse, filterStatus]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (cls: ClassItem) => {
    setEditingId(cls.id);
    setForm({
      name: cls.name,
      code: cls.code,
      courseId: cls.courseId,
      branchId: cls.branchId,
      teacherId: cls.teacherId ?? '',
      startDate: cls.startDate.slice(0, 10),
      endDate: cls.endDate.slice(0, 10),
      capacity: String(cls.capacity),
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

    if (!form.name.trim()) {
      setFormError('Tên lớp học là bắt buộc.');
      return;
    }
    if (!form.code.trim()) {
      setFormError('Mã lớp học là bắt buộc.');
      return;
    }
    if (!form.courseId) {
      setFormError('Vui lòng chọn khóa học.');
      return;
    }
    if (!form.branchId) {
      setFormError('Vui lòng chọn chi nhánh.');
      return;
    }
    if (!form.startDate) {
      setFormError('Vui lòng chọn ngày bắt đầu.');
      return;
    }
    if (!form.endDate) {
      setFormError('Vui lòng chọn ngày kết thúc.');
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setFormError('Ngày bắt đầu phải trước ngày kết thúc.');
      return;
    }
    const cap = parseInt(form.capacity, 10);
    if (isNaN(cap) || cap < 1) {
      setFormError('Sức chứa phải lớn hơn 0.');
      return;
    }

    setSaving(true);
    try {
      const payload: CreateClassInput = {
        name: form.name.trim(),
        code: form.code.trim(),
        courseId: form.courseId,
        branchId: form.branchId,
        teacherId: form.teacherId || null,
        startDate: form.startDate,
        endDate: form.endDate,
        capacity: cap,
      };
      if (editingId) {
        await classApi.update(editingId, payload, organizationId);
      } else {
        await classApi.create(payload, organizationId);
      }
      setModalOpen(false);
      await loadAll();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : '';
      if (msg.includes('409') || msg.includes('đã tồn tại')) {
        setFormError('Mã code này đã tồn tại.');
      } else {
        setFormError('Lưu thất bại. Kiểm tra lại thông tin.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    try {
      await classApi.remove(deletingId, organizationId);
      setDeletingId(null);
      await loadAll();
    } catch {
      setError('Hủy lớp học thất bại.');
      setDeletingId(null);
    } finally {
      setSaving(false);
    }
  };

  const openView = (cls: ClassItem) => {
    navigate(`/classes/${cls.id}${organizationId ? `?organizationId=${organizationId}` : ''}`);
  };

  const getCourseName = (id: string) => courseMap.get(id)?.name ?? '—';
  const getBranchName = (id: string) => branchMap.get(id)?.name ?? '—';
  const getTeacherName = (id: string | null) =>
    id ? (teacherMap.get(id)?.user?.fullName ?? '—') : '—';

  const statusClass = (s: ClassStatus) => `cls-status ${s.toLowerCase()}`;

  return (
    <DashboardLayout
      activeLabel="Classes"
      searchPlaceholder="Tìm kiếm lớp học..."
    >
      <div className="dashboard-content classes-content">
        <div className="classes-heading">
          <div>
            <h1>Classes</h1>
            <small>Manage and organize your classes</small>
          </div>
          <button className="classes-add" type="button" onClick={openCreate}>
            + Create Class
          </button>
        </div>

        {error && <div className="classes-error">{error}</div>}

        <div className="classes-toolbar">
          <div className="classes-search">
            <span>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search classes..."
              aria-label="Tìm kiếm lớp học"
            />
          </div>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.entries(statusLabels).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div className="classes-panel">
          <table className="classes-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Course</th>
                <th>Branch</th>
                <th>Teacher</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="classes-empty">
                    {query || filterBranch || filterCourse || filterStatus
                      ? 'No classes match your filters.'
                      : 'No classes yet. Click "Create Class" to add one.'}
                  </td>
                </tr>
              )}
              {paged.map((cls) => (
                <tr key={cls.id}>
                  <td>
                    <div className="classes-class-cell">
                      <strong>{cls.name}</strong>
                      <span className="classes-code">{cls.code}</span>
                    </div>
                  </td>
                  <td>{getCourseName(cls.courseId)}</td>
                  <td>{getBranchName(cls.branchId)}</td>
                  <td>{getTeacherName(cls.teacherId)}</td>
                  <td>{cls.capacity}</td>
                  <td>
                    <span className={statusClass(cls.status)}>
                      {statusLabels[cls.status]}
                    </span>
                  </td>
                  <td className="classes-actions">
                    <button
                      type="button"
                      className="action-link"
                      onClick={() => openView(cls)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="action-link"
                      onClick={() => openEdit(cls)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="action-link danger"
                      onClick={() => setDeletingId(cls.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length > PAGE_SIZE && (
            <div className="classes-pagination">
              <span>
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
                {filtered.length}
              </span>
              <div className="classes-pagination-controls">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    type="button"
                    className={safePage === i + 1 ? 'page-current' : ''}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="classes-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="classes-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="classes-modal-header">
              <h3>{editingId ? 'Edit Class' : 'Create Class'}</h3>
              <button
                type="button"
                className="classes-modal-close"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>
            {formError && <div className="classes-form-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <label>
                Class name
                <input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. BE-K01"
                />
              </label>
              <label>
                Class code
                <input
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value)}
                  placeholder="e.g. BE-01"
                />
              </label>
              <label>
                Course
                <select
                  value={form.courseId}
                  onChange={(e) => updateField('courseId', e.target.value)}
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Branch
                <select
                  value={form.branchId}
                  onChange={(e) => updateField('branchId', e.target.value)}
                >
                  <option value="">Select branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Teacher
                <select
                  value={form.teacherId}
                  onChange={(e) => updateField('teacherId', e.target.value)}
                >
                  <option value="">Select teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.user?.fullName ?? t.teacherCode}</option>
                  ))}
                </select>
              </label>
              <label>
                Start date
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                />
              </label>
              <label>
                Capacity
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => updateField('capacity', e.target.value)}
                  placeholder="30"
                />
              </label>
              <div className="classes-modal-actions">
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
        <div className="classes-modal-backdrop" onClick={() => setDeletingId(null)}>
          <div
            className="classes-modal classes-confirm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>Cancel Class</h3>
            <p>Are you sure you want to cancel this class? This will mark it as cancelled.</p>
            <div className="classes-modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setDeletingId(null)}
              >
                No
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ClassesPage;