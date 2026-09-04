import { useEffect, useState } from 'react';
import { classApi, type ClassItem, type UpdateClassInput } from '../../services/class.service';
import { branchApi, type Branch } from '../../services/branch.service';
import { courseApi, type Course } from '../../services/course.service';
import { teachersApi, type Teacher } from '../../services/teachers.service';
import './ClassesPage.css';
import './EditClassDrawer.css';

interface EditClassDrawerProps {
  classItem: ClassItem;
  organizationId?: string;
  onClose: () => void;
  onSaved: (updated: ClassItem) => void;
}

function toISODate(v: string): string {
  return v ? new Date(v).toISOString().slice(0, 10) : '';
}

function EditClassDrawer({
  classItem,
  organizationId,
  onClose,
  onSaved,
}: EditClassDrawerProps) {
  const [form, setForm] = useState({
    name: classItem.name,
    code: classItem.code,
    courseId: classItem.courseId,
    branchId: classItem.branchId,
    teacherId: classItem.teacherId ?? '',
    capacity: String(classItem.capacity),
    startDate: toISODate(classItem.startDate),
    endDate: toISODate(classItem.endDate),
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [b, co, t] = await Promise.all([
          branchApi.findAll(organizationId),
          courseApi.findAll(organizationId),
          teachersApi.findAll(organizationId),
        ]);
        if (active) {
          setBranches(b);
          setCourses(co);
          setTeachers(t);
        }
      } catch {
        if (active) setFormError('Không thể tải dữ liệu.');
      }
    })();
    return () => { active = false; };
  }, [organizationId]);

  const updateField = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const data: UpdateClassInput = {
        name: form.name,
        code: form.code,
        courseId: form.courseId,
        branchId: form.branchId,
        teacherId: form.teacherId || null,
        capacity: Number(form.capacity) || 1,
        startDate: form.startDate,
        endDate: form.endDate,
      };
      const updated = await classApi.update(classItem.id, data, organizationId);
      onSaved(updated);
    } catch (err: unknown) {
      let message = 'Cập nhật lớp học thất bại.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const anyErr = err as { response?: { data?: { message?: unknown } } };
        const raw = anyErr.response?.data?.message;
        if (Array.isArray(raw)) {
          message = raw.join(', ');
        } else if (typeof raw === 'string') {
          message = raw;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-class-backdrop" onClick={onClose}>
      <div
        className="edit-class-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="edit-class-header">
          <h3>Chỉnh sửa lớp</h3>
          <button
            type="button"
            className="edit-class-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {formError && <div className="classes-form-error">{formError}</div>}

        <form className="edit-class-form" onSubmit={handleSave}>
          <label>
            Tên lớp
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="VD: BE-K01"
            />
          </label>
          <label>
            Mã lớp
            <input
              value={form.code}
              onChange={(e) => updateField('code', e.target.value)}
              placeholder="VD: BE-01"
            />
          </label>
          <label>
            Khóa học
            <select
              value={form.courseId}
              onChange={(e) => updateField('courseId', e.target.value)}
            >
              <option value="">Chọn khóa học</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            Chi nhánh
            <select
              value={form.branchId}
              onChange={(e) => updateField('branchId', e.target.value)}
            >
              <option value="">Chọn chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label>
            Giáo viên
            <select
              value={form.teacherId}
              onChange={(e) => updateField('teacherId', e.target.value)}
            >
              <option value="">Chọn giáo viên</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.user?.fullName ?? t.teacherCode}</option>
              ))}
            </select>
          </label>
          <label>
            Ngày bắt đầu
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
            />
          </label>
          <label>
            Ngày kết thúc
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
            />
          </label>
          <label>
            Sức chứa
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => updateField('capacity', e.target.value)}
              placeholder="30"
            />
          </label>
          <div className="edit-class-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditClassDrawer;