import { useState } from 'react';
import {
  teachersApi,
  type CreateTeacherInput,
  type Teacher,
} from '../../services/teachers.service';
import type { Branch } from '../../services/branch.service';

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  teacherCode: '',
  specialization: '',
  qualification: '',
  bio: '',
  hireDate: '',
};

type FormState = typeof emptyForm;

interface TeacherFormModalProps {
  teacher: Teacher | null;
  organizationId?: string;
  branches: Branch[];
  onClose: () => void;
  onSaved: (saved: Teacher, temporaryPassword?: string) => void;
}

function initForm(teacher: Teacher | null): FormState {
  if (!teacher) return emptyForm;
  return {
    fullName: teacher.user?.fullName ?? '',
    email: teacher.user?.email ?? '',
    phone: teacher.user?.phone ?? '',
    teacherCode: teacher.teacherCode,
    specialization: teacher.specialization ?? '',
    qualification: teacher.qualification ?? '',
    bio: teacher.bio ?? '',
    hireDate: teacher.hireDate ? teacher.hireDate.slice(0, 10) : '',
  };
}

function TeacherFormModal({
  teacher,
  organizationId,
  branches,
  onClose,
  onSaved,
}: TeacherFormModalProps) {
  const editingId = teacher?.id ?? null;
  const [form, setForm] = useState<FormState>(() => initForm(teacher));
  const [branchIds, setBranchIds] = useState<string[]>(
    () => teacher?.branches?.map((b) => b.id) ?? [],
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
    if (!form.teacherCode.trim()) {
      setFormError('Mã giáo viên là bắt buộc.');
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
          teacherCode: form.teacherCode.trim(),
          branchIds,
          specialization: form.specialization.trim() || undefined,
          qualification: form.qualification.trim() || undefined,
          bio: form.bio.trim() || undefined,
          hireDate: form.hireDate || undefined,
        };
        const saved = await teachersApi.update(editingId, payload, organizationId);
        onSaved(saved);
      } else {
        const payload: CreateTeacherInput = {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          teacherCode: form.teacherCode.trim(),
          branchIds,
          ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
          ...(form.specialization.trim()
            ? { specialization: form.specialization.trim() }
            : {}),
          ...(form.qualification.trim()
            ? { qualification: form.qualification.trim() }
            : {}),
          ...(form.bio.trim() ? { bio: form.bio.trim() } : {}),
          ...(form.hireDate ? { hireDate: form.hireDate } : {}),
        };
        const result = await teachersApi.create(payload, organizationId);
        onSaved(result.teacher, result.temporaryPassword);
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
    <div className="teachers-modal-backdrop" onClick={onClose}>
      <div
        className="teachers-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="teachers-modal-header">
          <h3>{editingId ? 'Edit Teacher' : 'Add Teacher'}</h3>
          <button type="button" className="teachers-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {formError && <div className="teachers-form-error">{formError}</div>}

        <form onSubmit={handleSubmit}>
          <p className="teachers-form-section">Personal Information</p>

          <label>
            Full name *
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
              placeholder="e.g. nguyenvana@gmail.com"
              disabled={!!editingId}
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="e.g. 0123456789"
            />
          </label>

          <p className="teachers-form-section">Professional Information</p>

          <label>
            Teacher code *
            <input
              value={form.teacherCode}
              onChange={(e) => updateField('teacherCode', e.target.value)}
              placeholder="e.g. GV001"
            />
          </label>
          <label>
            Branches *
            <div className="teachers-branch-box">
              {branches.length === 0 ? (
                <span className="teachers-branch-empty">
                  No branches available. Create a branch first.
                </span>
              ) : (
                branches.map((b) => (
                  <label key={b.id} className="teachers-branch-item">
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
            Specialization
            <input
              value={form.specialization}
              onChange={(e) => updateField('specialization', e.target.value)}
              placeholder="e.g. Backend Development"
            />
          </label>
          <label>
            Qualification
            <input
              value={form.qualification}
              onChange={(e) => updateField('qualification', e.target.value)}
              placeholder="e.g. Bachelor"
            />
          </label>
          <label>
            Hire date
            <input
              type="date"
              value={form.hireDate}
              onChange={(e) => updateField('hireDate', e.target.value)}
            />
          </label>
          <label>
            Bio
            <textarea
              value={form.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Short introduction of the teacher..."
              rows={3}
            />
          </label>

          <div className="teachers-modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherFormModal;