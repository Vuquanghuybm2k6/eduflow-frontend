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
    <DashboardLayout activeLabel="Teachers">
      <div className="dashboard-content teacher-detail-content">
        <button
          type="button"
          className="teacher-back"
          onClick={() => navigate('/teachers')}
        >
          ← Back to Teachers
        </button>

        {error && <div className="teacher-detail-error">{error}</div>}
        {loading && (!teacher || !error) && (
          <div className="teacher-detail-loading">Loading...</div>
        )}

        {!loading && teacher && (
          <>
            <div className="teacher-heading">
              <div>
                <h1>Teacher Profile</h1>
                <small>View and manage teacher information</small>
              </div>
              <button
                type="button"
                className="teacher-edit-btn"
                onClick={() => setEditOpen(true)}
              >
                Edit
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
                    {teacher.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="teacher-info-grid">
              <section className="teacher-info-card">
                <h3>Personal Information</h3>
                <div className="teacher-info-row">
                  <span>Email</span>
                  <strong>{teacher.user?.email ?? '—'}</strong>
                </div>
                <div className="teacher-info-row">
                  <span>Phone</span>
                  <strong>{teacher.user?.phone ?? '—'}</strong>
                </div>
              </section>

              <section className="teacher-info-card">
                <h3>Professional Information</h3>
                <div className="teacher-info-row">
                  <span>Specialization</span>
                  <strong>{teacher.specialization ?? '—'}</strong>
                </div>
                <div className="teacher-info-row">
                  <span>Branches</span>
                  <strong>
                    {(teacher.branches ?? []).length > 0
                      ? teacher.branches!.map((b) => b.name).join(', ')
                      : '—'}
                  </strong>
                </div>
                <div className="teacher-info-row">
                  <span>Qualification</span>
                  <strong>{teacher.qualification ?? '—'}</strong>
                </div>
                <div className="teacher-info-row">
                  <span>Hire date</span>
                  <strong>
                    {teacher.hireDate
                      ? new Date(teacher.hireDate).toLocaleDateString('en-GB')
                      : '—'}
                  </strong>
                </div>
                {teacher.bio && (
                  <div className="teacher-info-row">
                    <span>Bio</span>
                    <strong>{teacher.bio}</strong>
                  </div>
                )}
              </section>
            </div>

            <div className="teacher-classes">
              <div className="teacher-classes-head">
                <h3>Classes taught</h3>
                <button
                  type="button"
                  className="teacher-view-all"
                  onClick={() => setViewingClasses(true)}
                >
                  View all classes
                </button>
              </div>

              <div className="teacher-classes-panel">
                <table className="teacher-classes-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Course</th>
                      <th>Students</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taughtClasses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="teachers-empty">
                          This teacher has no classes yet.
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
                              className={`cls-status ${c.status.toLowerCase()}`}
                            >
                              {c.status}
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
                  {teacher.user?.fullName ?? 'Teacher'} — Classes
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
                  This teacher has no classes yet.
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
                        <span className={`cls-status ${c.status.toLowerCase()}`}>
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
                  onClick={() => setViewingClasses(false)}
                >
                  Close
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