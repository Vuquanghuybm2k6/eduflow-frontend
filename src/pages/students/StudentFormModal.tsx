import { useState } from 'react';
import {
  studentsApi,
  type CreateStudentInput,
  type Student,
  type StudentGender,
} from '../../services/students.service';
import type { Branch } from '../../services/branch.service';

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  studentCode: '',
  dateOfBirth: '',
  gender: '',
  address: '',
};

type FormState = typeof emptyForm;

interface StudentFormModalProps {
  student: Student | null;
  organizationId?: string;
  branches: Branch[];
  onClose: () => void;
  onSaved: (saved: Student, temporaryPassword?: string) => void;
}

function initForm(student: Student | null): FormState {
  if (!student) return emptyForm;
  return {
    fullName: student.user?.fullName ?? '',
    email: student.user?.email ?? '',
    phone: student.user?.phone ?? '',
    studentCode: student.studentCode,
    dateOfBirth: student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : '',
    gender: student.gender ?? '',
    address: student.address ?? '',
  };
}

function StudentFormModal({
  student,
  organizationId,
  branches,
  onClose,
  onSaved,
}: StudentFormModalProps) {
  const editingId = student?.id ?? null;
  const [form, setForm] = useState<FormState>(() => initForm(student));
  const [branchIds, setBranchIds] = useState<string[]>(
    () => student?.branches?.map((b) => b.id) ?? [],
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleBranch = (id: string) => {
    setBranchIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.fullName.trim()) {
      setFormError('Họ và tên là bắt buộc.');
      return;
    }
    if (!form.email.trim()) {
      setFormError('Email là bắt buộc.');
      return;
    }
    if (!form.studentCode.trim()) {
      setFormError('Mã học viên là bắt buộc.');
      return;
    }
    if (branchIds.length === 0) {
      setFormError('Bạn phải chọn ít nhất một chi nhánh.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const payload = {
          studentCode: form.studentCode.trim(),
          branchIds,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: (form.gender || undefined) as StudentGender | undefined,
          address: form.address.trim() || undefined,
        };
        const saved = await studentsApi.update(editingId, payload, organizationId);
        onSaved(saved);
      } else {
        const payload: CreateStudentInput = {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          studentCode: form.studentCode.trim(),
          branchIds,
          ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
          ...(form.dateOfBirth ? { dateOfBirth: form.dateOfBirth } : {}),
          ...(form.gender
            ? { gender: form.gender as StudentGender }
            : {}),
          ...(form.address.trim() ? { address: form.address.trim() } : {}),
        };
        const result = await studentsApi.create(payload, organizationId);
        onSaved(result.student, result.temporaryPassword);
      }
    } catch (err) {
      const anyErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = anyErr.response?.data?.message;
      if (Array.isArray(msg)) {
        setFormError(msg[0] ?? 'Lưu thất bại. Kiểm tra lại thông tin.');
      } else if (typeof msg === 'string' && msg.trim()) {
        setFormError(msg);
      } else {
        setFormError('Lưu thất bại. Kiểm tra lại thông tin.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="students-modal-backdrop" onClick={onClose}>
      <div
        className="students-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="students-modal-header">
          <h3>{editingId ? 'Sửa học viên' : 'Thêm học viên'}</h3>
          <button type="button" className="students-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {formError && <div className="students-form-error">{formError}</div>}

        <form onSubmit={handleSubmit}>
          <p className="students-form-section">Thông tin cá nhân</p>

          <label>
            Họ và tên *
            <input
              value={form.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="e.g. Nguyễn Văn A"
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="e.g. huy@gmail.com"
              disabled={!!editingId}
            />
          </label>
          <label>
            Điện thoại
            <input
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="e.g. 0123456789"
            />
          </label>
          <label>
            Ngày sinh
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => updateField('dateOfBirth', e.target.value)}
            />
          </label>
          <label>
            Giới tính
            <select
              value={form.gender}
              onChange={(e) => updateField('gender', e.target.value)}
            >
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </label>

          <p className="students-form-section">Thông tin học viên</p>

          <label>
            Mã học viên *
            <input
              value={form.studentCode}
              onChange={(e) => updateField('studentCode', e.target.value)}
              placeholder="e.g. HV001"
            />
          </label>
          <label>
            Chi nhánh *
            <div className="students-branch-box">
              {branches.length === 0 ? (
                <span className="students-branch-empty">
                  Chưa có chi nhánh. Vui lòng tạo chi nhánh trước.
                </span>
              ) : (
                branches.map((b) => (
                  <label key={b.id} className="students-branch-item">
                    <input
                      type="checkbox"
                      checked={branchIds.includes(b.id)}
                      onChange={() => toggleBranch(b.id)}
                    />
                    <span>{b.name}</span>
                  </label>
                ))
              )}
            </div>
          </label>
          <label>
            Địa chỉ
            <textarea
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Địa chỉ học viên..."
              rows={2}
            />
          </label>

          <div className="students-modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo học viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentFormModal;