import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { teachersApi, type Teacher } from '../../services/teachers.service';
import { classApi, type ClassItem } from '../../services/class.service';
import { courseApi, type Course } from '../../services/course.service';
import { branchApi, type Branch } from '../../services/branch.service';
import TeacherFormModal from './TeacherFormModal';
import DashboardLayout from '../../layouts/DashboardLayout';
import './TeachersPage.css';
import './TeacherDetailPage.css';

function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingClasses, setViewingClasses] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(
    async (t?: Teacher) => {
      if (t) setTeacher(t);
      try {
        const [c, co, b] = await Promise.all([
          classApi.findAll(organizationId),
          courseApi.findAll(organizationId),
          branchApi.findAll(organizationId),
        ]);
        setClasses(c);
        setCourses(co);
        setBranches(b);
        setError(null);
      } catch {
        setError('Không thể tải dữ liệu liên quan.');
      }
    },
    [organizationId],
  );

  useEffect(() => {
    let active = true;
    if (!id) return;
    (async () => {
      try {
        const [t, c, co, b] = await Promise.all([
          teachersApi.findOne(id, organizationId),
          classApi.findAll(organizationId),
          courseApi.findAll(organizationId),
          branchApi.findAll(organizationId),
        ]);
        if (active) {
          setTeacher(t);
          setClasses(c);
          setCourses(co);
          setBranches(b);
          setError(null);
        }
      } catch {
        if (active) setError('Không thể tải thông tin giáo viên.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, organizationId]);

  const courseMap = useMemo(() => {
    const m = new Map<string, string>();
    courses.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [courses]);

  const branchMap = useMemo(() => {
    const m = new Map<string, string>();
    branches.forEach((b) => m.set(b.id, b.name));
    return m;
  }, [branches]);

  const taughtClasses = useMemo(
    () =>
      classes.filter((c) => c.teacherId === teacher?.id),
    [classes, teacher?.id],
  );

  const handleSaved = (saved: Teacher) => {
    setEditOpen(false);
    setTeacher(saved);
    void load(saved);
  };

  return (
    <DashboardLayout       activeLabel="Giáo viên">
      <div className="dashboard-content teacher-detail-content">
        <button
          type="button"
          className="teacher-back"
          onClick={() => navigate('/teachers')}
        >
          ← Quay lại danh sách giáo viên
        </button>

        {error && <div className="teacher-detail-error">{error}</div>}
        {loading && (!teacher || !error) && (
          <div className="teacher-detail-loading">Đang tải...</div>
        )}

        {!loading && teacher && (
          <>
            <div className="teacher-heading">
              <div>
                <h1>Hồ sơ giáo viên</h1>
                <small>Xem và quản lý thông tin giáo viên</small>
              </div>
              <button
                type="button"
                className="teacher-edit-btn"
                onClick={() => setEditOpen(true)}
              >
                Sửa
              </button>
            </div>

            <div className="teacher-card">
              <div className="teacher-card-avatar">
                {teacher.user?.avatarUrl ? (
                  <img src={teacher.user.avatarUrl} alt="" />
                ) : (
                  '👤'
                )}
              </div>
              <div className="teacher-card-main">
                <h2>{teacher.user?.fullName ?? '—'}</h2>
                <div className="teacher-card-meta">
                  <span className="teachers-code">{teacher.teacherCode}</span>
                  <span
                    className={`teacher-status ${teacher.status.toLowerCase()}`}
                  >
                    {teacher.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </div>
              </div>
            </div>

            <div className="teacher-info-grid">
              <section className="teacher-info-card">
                <h3>Thông tin cá nhân</h3>
                <div className="teacher-info-row">
                  <span>Email</span>
                  <strong>{teacher.user?.email ?? '—'}</strong>
                </div>
                <div className="teacher-info-row">
                  <span>Điện thoại</span>
                  <strong>{teacher.user?.phone ?? '—'}</strong>
                </div>
              </section>

              <section className="teacher-info-card">
                <h3>Thông tin chuyên môn</h3>
                <div className="teacher-info-row">
                  <span>Chuyên môn</span>
                  <strong>{teacher.specialization ?? '—'}</strong>
                </div>
                <div className="teacher-info-row">
                  <span>Chi nhánh</span>
                  <strong>
                    {(teacher.branches ?? []).length > 0
                      ? teacher.branches!.map((b) => b.name).join(', ')
                      : '—'}
                  </strong>
                </div>
                <div className="teacher-info-row">
                  <span>Trình độ</span>
                  <strong>{teacher.qualification ?? '—'}</strong>
                </div>
                <div className="teacher-info-row">
                  <span>Ngày tuyển dụng</span>
                  <strong>
                    {teacher.hireDate
                      ? new Date(teacher.hireDate).toLocaleDateString('en-GB')
                      : '—'}
                  </strong>
                </div>
                {teacher.bio && (
                  <div className="teacher-info-row">
                    <span>Giới thiệu</span>
                    <strong>{teacher.bio}</strong>
                  </div>
                )}
              </section>
            </div>

            <div className="teacher-classes">
              <div className="teacher-classes-head">
                <h3>Lớp đang giảng dạy</h3>
                <button
                  type="button"
                  className="teacher-view-all"
                  onClick={() => setViewingClasses(true)}
                >
                  Xem tất cả lớp
                </button>
              </div>

              <div className="teacher-classes-panel">
                <table className="teacher-classes-table">
                  <thead>
                    <tr>
                      <th>Lớp học</th>
                      <th>Khóa học</th>
                      <th>Sĩ số</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taughtClasses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="teachers-empty">
                          Giáo viên chưa có lớp học nào.
                        </td>
                      </tr>
                    ) : (
                      taughtClasses.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <strong className="teacher-class-name">
                              {c.name}
                            </strong>
                            <span className="teachers-code teacher-class-code">
                              {c.code}
                            </span>
                          </td>
                          <td>{courseMap.get(c.courseId) ?? '—'}</td>
                          <td>{c.capacity}</td>
                          <td>
                            <span
                              className={`cls-status ${(c.lifecycleStatus ?? '').toLowerCase()}`}
                            >
                              {c.lifecycleStatus ?? '—'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {viewingClasses && teacher && (
          <div
            className="teachers-modal-backdrop"
            onClick={() => setViewingClasses(false)}
          >
            <div
              className="teachers-modal teachers-classes-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="teachers-modal-header">
                <h3>
                  {teacher.user?.fullName ?? 'Giáo viên'} — Lớp học
                </h3>
                <button
                  type="button"
                  className="teachers-modal-close"
                  onClick={() => setViewingClasses(false)}
                >
                  ✕
                </button>
              </div>
              {taughtClasses.length === 0 ? (
                <div className="teachers-modal-empty">
                  Giáo viên chưa có lớp học nào.
                </div>
              ) : (
                <ul className="teachers-classes-list">
                  {taughtClasses.map((c) => (
                    <li key={c.id}>
                      <div>
                        <strong>{c.name}</strong>
                        <span className="teachers-code">{c.code}</span>
                      </div>
                      <div className="teachers-classes-meta">
                        <span>{courseMap.get(c.courseId) ?? '—'}</span>
                        <span>{branchMap.get(c.branchId) ?? '—'}</span>
                        <span className={`cls-status ${(c.lifecycleStatus ?? '').toLowerCase()}`}>
                          {c.lifecycleStatus ?? '—'}
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
                  onClick={() => setViewingClasses(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {editOpen && teacher && (
          <TeacherFormModal
            teacher={teacher}
            organizationId={organizationId}
            branches={branches}
            onClose={() => setEditOpen(false)}
            onSaved={handleSaved}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default TeacherDetailPage;