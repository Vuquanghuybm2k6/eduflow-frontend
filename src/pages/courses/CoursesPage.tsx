import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  courseApi,
  type Course,
  type CourseStatus,
  type CreateCourseInput,
} from '../../services/course.service';
import DashboardLayout from '../../layouts/DashboardLayout';
import './CoursesPage.css';

const emptyForm = {
  name: '',
  code: '',
  description: '',
  duration: '',
  tuitionFee: '',
  status: 'active' as CourseStatus,
};

type FormState = {
  name: string;
  code: string;
  description: string;
  duration: string;
  tuitionFee: string;
  status: CourseStatus;
};

const statusLabels: Record<CourseStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

function CoursesPage() {
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;

  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await courseApi.findAll(organizationId);
      setCourses(data);
      setError(null);
    } catch {
      setError(
        'Không thể tải danh sách khóa học. Kiểm tra quyền truy cập hoặc organizationId.',
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    let active = true;

    async function fetchCourses() {
      try {
        const data = await courseApi.findAll(organizationId);
        if (active) {
          setCourses(data);
          setError(null);
        }
      } catch {
        if (active) {
          setError(
            'Không thể tải danh sách khóa học. Kiểm tra quyền truy cập hoặc organizationId.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchCourses();

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

  const openEdit = (course: Course) => {
    setEditingId(course.id);
    setForm({
      name: course.name,
      code: course.code,
      description: course.description ?? '',
      duration: course.duration != null ? String(course.duration) : '',
      tuitionFee: course.tuitionFee != null ? String(course.tuitionFee) : '',
      status: course.status,
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
      setFormError('Tên và mã khóa học là bắt buộc.');
      return;
    }

    setSaving(true);
    try {
      const payload: CreateCourseInput = {
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description.trim() || undefined,
        duration: form.duration !== '' ? Number(form.duration) : undefined,
        tuitionFee:
          form.tuitionFee !== '' ? Number(form.tuitionFee) : undefined,
        status: form.status,
      };

      if (editingId) {
        await courseApi.update(editingId, payload, organizationId);
      } else {
        await courseApi.create(payload, organizationId);
      }

      setModalOpen(false);
      await load();
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      setFormError(
        status === 409 ? 'Mã code này đã tồn tại' : 'Lưu thất bại. Kiểm tra lại thông tin.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    setError(null);
    try {
      await courseApi.remove(deletingId, organizationId);
      setDeletingId(null);
      await load();
    } catch {
      setError('Xóa khóa học thất bại.');
      setDeletingId(null);
    } finally {
      setSaving(false);
    }
  };

  const query = search.trim().toLowerCase();
  const filteredCourses = query
    ? courses.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query),
      )
    : courses;

  return (
    <DashboardLayout
      activeLabel="Courses"
      searchPlaceholder="Tìm kiếm khóa học, học viên, lớp học..."
    >
      <div className="dashboard-content crs-content">
        <div className="crs-heading">
          <div>
            <h1>Courses</h1>
            <small>Manage the courses of your organization</small>
          </div>
          <button className="crs-add" type="button" onClick={openCreate}>
            ＋ Create Course
          </button>
        </div>

        {error && <div className="crs-error">{error}</div>}

        {loading && <div className="crs-loading">Đang tải khóa học...</div>}

        {!loading && (
          <>
            <div className="crs-search">
              <span aria-hidden="true" className="crs-search-icon">
                ⌕
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses by name or code..."
              />
            </div>

            {filteredCourses.length === 0 ? (
              <div className="crs-empty">
                {courses.length === 0
                  ? 'No courses yet. Click "Create Course" to add one.'
                  : 'No courses match your search.'}
              </div>
            ) : (
              <div className="crs-table-wrap">
                <table className="crs-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Status</th>
                      <th>Duration</th>
                      <th>Tuition</th>
                      <th className="crs-th-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id}>
                        <td className="crs-cell-name">
                          <span className="crs-row-name">{course.name}</span>
                          <span className="crs-row-desc">
                            {course.description || 'No description.'}
                          </span>
                        </td>
                        <td>
                          <span className="crs-code">{course.code}</span>
                        </td>
                        <td>
                          <span className={`crs-status ${course.status}`}>
                            ● {statusLabels[course.status]}
                          </span>
                        </td>
                        <td>
                          {course.duration != null
                            ? `${course.duration} hrs`
                            : '—'}
                        </td>
                        <td>
                          {course.tuitionFee != null
                            ? Number(course.tuitionFee).toLocaleString('vi-VN')
                            : '—'}
                        </td>
                        <td className="crs-cell-actions">
                          <button
                            type="button"
                            className="action-link"
                            onClick={() => setViewingCourse(course)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="action-link"
                            onClick={() => openEdit(course)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="action-link danger"
                            onClick={() => setDeletingId(course.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <div className="crs-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="crs-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>{editingId ? 'Edit Course' : 'Create Course'}</h3>
            {formError && <div className="crs-form-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <label>
                Name *
                <input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Mathematics"
                />
              </label>
              <label>
                Code *
                <input
                  value={form.code}
                  onChange={(e) => updateField('code', e.target.value)}
                  placeholder="e.g. MATH-101"
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Short description of the course"
                  rows={3}
                />
              </label>
              <label>
                Duration (hours)
                <input
                  type="number"
                  min={0}
                  value={form.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                  placeholder="e.g. 40"
                />
              </label>
              <label>
                Tuition Fee (VND)
                <input
                  type="number"
                  min={0}
                  value={form.tuitionFee}
                  onChange={(e) => updateField('tuitionFee', e.target.value)}
                  placeholder="e.g. 3500000"
                />
              </label>
              <fieldset className="crs-field">
                <legend>Status</legend>
                {(['active', 'inactive'] as CourseStatus[]).map((s) => (
                  <label key={s} className="crs-radio">
                    <input
                      type="radio"
                      name="crs-status"
                      value={s}
                      checked={form.status === s}
                      onChange={() => updateField('status', s)}
                    />
                    <span>● {statusLabels[s]}</span>
                  </label>
                ))}
              </fieldset>
              <div className="crs-modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="crs-modal-backdrop" onClick={() => setDeletingId(null)}>
          <div
            className="crs-modal crs-confirm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>Delete Course</h3>
            <p>
              Are you sure you want to delete this course? This action cannot be
              undone.
            </p>
            <div className="crs-modal-actions">
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

      {viewingCourse && (
        <div
          className="crs-modal-backdrop"
          onClick={() => setViewingCourse(null)}
        >
          <div
            className="crs-modal crs-view"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>Course Details</h3>
            <dl className="crs-view-list">
              <div>
                <dt>Name</dt>
                <dd>{viewingCourse.name}</dd>
              </div>
              <div>
                <dt>Code</dt>
                <dd>{viewingCourse.code}</dd>
              </div>
              <div>
                <dt>Description</dt>
                <dd>{viewingCourse.description || '—'}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>
                  {viewingCourse.duration != null
                    ? `${viewingCourse.duration} hours`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt>Tuition Fee</dt>
                <dd>
                  {viewingCourse.tuitionFee != null
                    ? Number(viewingCourse.tuitionFee).toLocaleString('vi-VN') +
                      ' VND'
                    : '—'}
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={`crs-status ${viewingCourse.status}`}>
                    ● {statusLabels[viewingCourse.status]}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>
                  {viewingCourse.createdAt
                    ? new Date(viewingCourse.createdAt).toLocaleString('vi-VN')
                    : '—'}
                </dd>
              </div>
            </dl>
            <div className="crs-modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setViewingCourse(null)}
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

export default CoursesPage;
