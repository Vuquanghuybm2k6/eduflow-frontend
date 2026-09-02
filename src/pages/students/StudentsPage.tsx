import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  studentsApi,
  type Student,
  type StudentStatus,
} from '../../services/students.service';
import { branchApi, type Branch } from '../../services/branch.service';
import StudentFormModal from './StudentFormModal';
import DashboardLayout from '../../layouts/DashboardLayout';
import './StudentsPage.css';

const PAGE_SIZE = 10;

const statusLabels: Record<StudentStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const genderLabels: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

function StudentsPage() {
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [page, setPage] = useState(1);

  const [formModal, setFormModal] = useState<{
    open: boolean;
    student: Student | null;
  }>({ open: false, student: null });
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [menuStudentId, setMenuStudentId] = useState<string | null>(null);
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, b] = await Promise.all([
        studentsApi.findAll(organizationId),
        branchApi.findAll(organizationId),
      ]);
      setStudents(s);
      setBranches(b);
      setError(null);
    } catch {
      setError('Không thể tải danh sách học viên.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, b] = await Promise.all([
          studentsApi.findAll(organizationId),
          branchApi.findAll(organizationId),
        ]);
        if (active) {
          setStudents(s);
          setBranches(b);
          setError(null);
        }
      } catch {
        if (active) setError('Không thể tải danh sách học viên.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [organizationId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      if (q) {
        const name = (s.user?.fullName ?? '').toLowerCase();
        const email = (s.user?.email ?? '').toLowerCase();
        const code = s.studentCode.toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !code.includes(q)) {
          return false;
        }
      }
      if (filterGender && s.gender !== filterGender) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      if (filterBranch) {
        const studentBranches = s.branches ?? [];
        if (!studentBranches.some((b) => b.id === filterBranch)) return false;
      }
      return true;
    });
  }, [students, query, filterGender, filterStatus, filterBranch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  useEffect(() => {
    setPage(1);
  }, [query, filterGender, filterStatus, filterBranch]);

  const openCreate = () => {
    setFormModal({ open: true, student: null });
  };

  const openEdit = (s: Student) => {
    setMenuStudentId(null);
    setFormModal({ open: true, student: s });
  };

  const handleSaved = (_saved: Student, temporaryPassword?: string) => {
    setFormModal({ open: false, student: null });
    if (temporaryPassword) setCreatedPassword(temporaryPassword);
    void load();
  };

  const handleToggleStatus = async (s: Student) => {
    const next: StudentStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setSavingStatusId(s.id);
    try {
      await studentsApi.updateStatus(s.id, next, organizationId);
      await load();
    } catch {
      setError('Cập nhật trạng thái thất bại.');
    } finally {
      setSavingStatusId(null);
    }
  };

  return (
    <DashboardLayout
      activeLabel="Students"
      searchPlaceholder="Tìm kiếm học viên, lớp học..."
    >
      <div className="dashboard-content students-content">
        <div className="students-heading">
          <div>
            <h1>Students</h1>
            <small>Manage and organize students in your organization</small>
          </div>
          <button className="students-add" type="button" onClick={openCreate}>
            + Add Student
          </button>
        </div>

        {error && <div className="students-error">{error}</div>}

        <div className="students-toolbar">
          <div className="students-search">
            <span>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students..."
              aria-label="Tìm kiếm học viên"
            />
          </div>
        </div>

        <div className="students-filters">
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="students-filter"
          >
            <option value="">Branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="students-filter"
          >
            <option value="">Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="students-filter"
          >
            <option value="">Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="students-section-head">
          <h2>Students</h2>
          <span>{filtered.length} students</span>
        </div>

        <div className="students-panel">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Code</th>
                <th>Branch</th>
                <th>Gender</th>
                <th>Status</th>
                <th className="students-th-actions" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {!loading && paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="students-empty">
                    {query || filterBranch || filterGender || filterStatus
                      ? 'No students match your filters.'
                      : 'No students yet. Click "Add Student" to create one.'}
                  </td>
                </tr>
              )}
              {paged.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="students-person">
                      <span className="students-avatar">
                        {s.user?.avatarUrl ? (
                          <img src={s.user.avatarUrl} alt="" />
                        ) : (
                          '👤'
                        )}
                      </span>
                      <div>
                        <strong className="students-name">
                          {s.user?.fullName ?? '—'}
                        </strong>
                        <small className="students-email">
                          {s.user?.email ?? '—'}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="students-code">{s.studentCode}</span>
                  </td>
                  <td>
                    {(s.branches ?? []).length > 0 ? (
                      <span className="students-branch-tags">
                        {s.branches!.map((b) => (
                          <span key={b.id} className="students-branch-tag">
                            {b.name}
                          </span>
                        ))}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{s.gender ? genderLabels[s.gender] ?? s.gender : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className={`student-status ${s.status.toLowerCase()}`}
                      onClick={() => handleToggleStatus(s)}
                      disabled={savingStatusId === s.id}
                      title={`Click để chuyển sang ${
                        s.status === 'ACTIVE' ? 'Inactive' : 'Active'
                      }`}
                    >
                      {savingStatusId === s.id
                        ? 'Saving...'
                        : statusLabels[s.status]}
                    </button>
                  </td>
                  <td className="students-actions">
                    <div className="students-menu-wrap">
                      <button
                        type="button"
                        className="students-menu-btn"
                        onClick={() =>
                          setMenuStudentId((prev) =>
                            prev === s.id ? null : s.id,
                          )
                        }
                        aria-label="Actions"
                      >
                        ⋮
                      </button>
                      {menuStudentId === s.id && (
                        <>
                          <div
                            className="students-menu-backdrop"
                            onClick={() => setMenuStudentId(null)}
                          />
                          <div className="students-menu">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuStudentId(null);
                                navigate(`/students/${s.id}`);
                              }}
                            >
                              View details
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(s)}
                            >
                              Edit student
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length > PAGE_SIZE && (
            <div className="students-pagination">
              <span>
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
                {filtered.length}
              </span>
              <div className="students-pagination-controls">
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

      {formModal.open && (
        <StudentFormModal
          student={formModal.student}
          organizationId={organizationId}
          branches={branches}
          onClose={() => setFormModal({ open: false, student: null })}
          onSaved={handleSaved}
        />
      )}

      {createdPassword && (
        <div className="students-modal-backdrop">
          <div
            className="students-modal students-password"
            role="dialog"
            aria-modal="true"
          >
            <h3>Student Created</h3>
            <p>
              Share this temporary password with the student. They can change
              it after logging in.
            </p>
            <div className="students-password-box">{createdPassword}</div>
            <div className="students-modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setCreatedPassword(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default StudentsPage;