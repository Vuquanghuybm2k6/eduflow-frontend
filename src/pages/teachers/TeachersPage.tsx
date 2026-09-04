import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  teachersApi,
  type Teacher,
  type TeacherStatus,
} from '../../services/teachers.service';
import { classApi, type ClassItem } from '../../services/class.service';
import { branchApi, type Branch } from '../../services/branch.service';
import { courseApi, type Course } from '../../services/course.service';
import TeacherFormModal from './TeacherFormModal';
import DashboardLayout from '../../layouts/DashboardLayout';
import './TeachersPage.css';

const PAGE_SIZE = 10;

const statusLabels: Record<TeacherStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
};

function TeachersPage() {
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [page, setPage] = useState(1);

  const [formModal, setFormModal] = useState<{
    open: boolean;
    teacher: Teacher | null;
  }>({ open: false, teacher: null });
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [classesView, setClassesView] = useState<Teacher | null>(null);
  const [menuTeacherId, setMenuTeacherId] = useState<string | null>(null);
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [t, c, b, co] = await Promise.all([
        teachersApi.findAll(organizationId),
        classApi.findAll(organizationId),
        branchApi.findAll(organizationId),
        courseApi.findAll(organizationId),
      ]);
      setTeachers(t);
      setClasses(c);
      setBranches(b);
      setCourses(co);
      setError(null);
    } catch {
      setError('Không thể tải danh sách giáo viên.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [t, c, b, co] = await Promise.all([
          teachersApi.findAll(organizationId),
          classApi.findAll(organizationId),
          branchApi.findAll(organizationId),
          courseApi.findAll(organizationId),
        ]);
        if (active) {
          setTeachers(t);
          setClasses(c);
          setBranches(b);
          setCourses(co);
          setError(null);
        }
      } catch {
        if (active) setError('Không thể tải danh sách giáo viên.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [organizationId]);

  const classesByTeacher = useMemo(() => {
    const map = new Map<string, ClassItem[]>();
    for (const cls of classes) {
      if (!cls.teacherId) continue;
      const list = map.get(cls.teacherId) ?? [];
      list.push(cls);
      map.set(cls.teacherId, list);
    }
    return map;
  }, [classes]);

  const branchMap = useMemo(() => {
    const m = new Map<string, string>();
    branches.forEach((b) => m.set(b.id, b.name));
    return m;
  }, [branches]);

  const courseMap = useMemo(() => {
    const m = new Map<string, string>();
    courses.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [courses]);

  const specOptions = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.specialization) set.add(t.specialization);
    });
    return Array.from(set);
  }, [teachers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teachers.filter((t) => {
      if (q) {
        const name = (t.user?.fullName ?? '').toLowerCase();
        const email = (t.user?.email ?? '').toLowerCase();
        const code = t.teacherCode.toLowerCase();
        if (
          !name.includes(q) &&
          !email.includes(q) &&
          !code.includes(q)
        ) {
          return false;
        }
      }
      if (filterSpec && t.specialization !== filterSpec) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterBranch) {
        const teacherBranches = t.branches ?? [];
        if (!teacherBranches.some((b) => b.id === filterBranch)) return false;
      }
      return true;
    });
  }, [teachers, query, filterSpec, filterStatus, filterBranch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  useEffect(() => {
    setPage(1);
  }, [query, filterSpec, filterStatus, filterBranch]);

  const openCreate = () => {
    setFormModal({ open: true, teacher: null });
  };

  const openEdit = (t: Teacher) => {
    setMenuTeacherId(null);
    setFormModal({ open: true, teacher: t });
  };

  const handleSaved = (
    _saved: Teacher,
    temporaryPassword?: string,
  ) => {
    setFormModal({ open: false, teacher: null });
    if (temporaryPassword) setCreatedPassword(temporaryPassword);
    void load();
  };

  const handleToggleStatus = async (t: Teacher) => {
    const next: TeacherStatus = t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setSavingStatusId(t.id);
    try {
      await teachersApi.updateStatus(t.id, next, organizationId);
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? 'Cập nhật trạng thái thất bại.';
      setError(msg);
    } finally {
      setSavingStatusId(null);
    }
  };

  const teacherClasses = classesView
    ? classesByTeacher.get(classesView.id) ?? []
    : [];

  return (
    <DashboardLayout
      activeLabel="Giáo viên"
      searchPlaceholder="Tìm kiếm giáo viên..."
    >
      <div className="dashboard-content teachers-content">
        <div className="teachers-heading">
          <div>
            <h1>Giáo viên</h1>
            <small>Quản lý và tổ chức giáo viên trong tổ chức</small>
          </div>
          <button className="teachers-add" type="button" onClick={openCreate}>
            + Thêm giáo viên
          </button>
        </div>

        {error && <div className="teachers-error">{error}</div>}

        <div className="teachers-toolbar">
          <div className="teachers-search">
            <span>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm giáo viên..."
              aria-label="Tìm kiếm giáo viên"
            />
          </div>
        </div>

        <div className="teachers-filters">
          <select
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
            className="teachers-filter"
          >
            <option value="">Chuyên môn</option>
            {specOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="teachers-filter"
          >
            <option value="">Trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="teachers-filter"
          >
            <option value="">Chi nhánh</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="teachers-section-head">
          <h2>Giáo viên</h2>
          <span>{filtered.length} giáo viên</span>
        </div>

        <div className="teachers-panel">
          <table className="teachers-table">
            <thead>
              <tr>
                <th>Giáo viên</th>
                <th>Mã</th>
                <th>Chuyên môn</th>
                <th>Chi nhánh</th>
                <th>Lớp học</th>
                <th>Trạng thái</th>
                <th className="teachers-th-actions" aria-label="Thao tác" />
              </tr>
            </thead>
            <tbody>
              {!loading && paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="teachers-empty">
                    {query || filterSpec || filterStatus || filterBranch
                      ? 'Không tìm thấy giáo viên phù hợp.'
                      : 'Chưa có giáo viên nào. Nhấn "Thêm giáo viên" để tạo.'}
                  </td>
                </tr>
              )}
              {paged.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="teachers-person">
                      <span className="teachers-avatar">
                        {t.user?.avatarUrl ? (
                          <img src={t.user.avatarUrl} alt="" />
                        ) : (
                          '👤'
                        )}
                      </span>
                      <div>
                        <strong className="teachers-name">
                          {t.user?.fullName ?? '—'}
                        </strong>
                        <small className="teachers-email">
                          {t.user?.email ?? '—'}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="teachers-code">{t.teacherCode}</span>
                  </td>
                  <td>{t.specialization || '—'}</td>
                  <td>
                    {(t.branches ?? []).length > 0 ? (
                      <span className="teachers-branch-tags">
                        {t.branches!.map((b) => (
                          <span key={b.id} className="teachers-branch-tag">
                            {b.name}
                          </span>
                        ))}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <span className="teachers-classes-count">
                      {classesByTeacher.get(t.id)?.length ?? 0} lớp
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`teacher-status ${t.status.toLowerCase()}`}
                      onClick={() => handleToggleStatus(t)}
                      disabled={savingStatusId === t.id}
                      title={`Nhấn để chuyển sang ${
                        t.status === 'ACTIVE' ? 'Ngừng hoạt động' : 'Đang hoạt động'
                      }`}
                    >
                      {savingStatusId === t.id
                        ? 'Đang lưu...'
                        : statusLabels[t.status]}
                    </button>
                  </td>
                  <td className="teachers-actions">
                    <div className="teachers-menu-wrap">
                      <button
                        type="button"
                        className="teachers-menu-btn"
                        onClick={() =>
                          setMenuTeacherId((prev) =>
                            prev === t.id ? null : t.id,
                          )
                        }
                        aria-label="Thao tác"
                      >
                        ⋮
                      </button>
                      {menuTeacherId === t.id && (
                        <>
                          <div
                            className="teachers-menu-backdrop"
                            onClick={() => setMenuTeacherId(null)}
                          />
                          <div className="teachers-menu">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuTeacherId(null);
                                navigate(`/teachers/${t.id}`);
                              }}
                            >
                              Xem chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(t)}
                            >
                              Sửa giáo viên
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMenuTeacherId(null);
                                setClassesView(t);
                              }}
                            >
                              Xem lớp học
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
            <div className="teachers-pagination">
              <span>
                Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} trong{' '}
                {filtered.length}
              </span>
              <div className="teachers-pagination-controls">
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
        <TeacherFormModal
          teacher={formModal.teacher}
          organizationId={organizationId}
          branches={branches}
          onClose={() => setFormModal({ open: false, teacher: null })}
          onSaved={handleSaved}
        />
      )}

      {classesView && (
        <div
          className="teachers-modal-backdrop"
          onClick={() => setClassesView(null)}
        >
          <div
            className="teachers-modal teachers-classes-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="teachers-modal-header">
              <h3>
                {classesView.user?.fullName ?? 'Giáo viên'} — Lớp học
              </h3>
              <button
                type="button"
                className="teachers-modal-close"
                onClick={() => setClassesView(null)}
              >
                ✕
              </button>
            </div>
            {teacherClasses.length === 0 ? (
              <div className="teachers-modal-empty">
                Giáo viên chưa có lớp học nào.
              </div>
            ) : (
              <ul className="teachers-classes-list">
                {teacherClasses.map((c) => (
                  <li key={c.id}>
                    <div>
                      <strong>{c.name}</strong>
                      <span className="teachers-code">{c.code}</span>
                    </div>
                    <div className="teachers-classes-meta">
                      <span>{courseMap.get(c.courseId) ?? '—'}</span>
                      <span>{branchMap.get(c.branchId) ?? '—'}</span>
                      <span
                        className={`cls-status ${c.status.toLowerCase()}`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="teachers-modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setClassesView(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {createdPassword && (
        <div className="teachers-modal-backdrop">
          <div
            className="teachers-modal teachers-password"
            role="dialog"
            aria-modal="true"
          >
            <h3>Đã tạo giáo viên</h3>
            <p>
              Hãy chia sẻ mật khẩu tạm thời này với giáo viên. Họ có thể đổi
              mật khẩu sau khi đăng nhập.
            </p>
            <div className="teachers-password-box">{createdPassword}</div>
            <div className="teachers-modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setCreatedPassword(null)}
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default TeachersPage;