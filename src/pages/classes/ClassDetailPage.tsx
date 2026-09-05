import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { classApi, type ClassItem } from '../../services/class.service';
import { branchApi, type Branch } from '../../services/branch.service';
import { courseApi, type Course } from '../../services/course.service';
import { teachersApi, type Teacher } from '../../services/teachers.service';
import { studentsApi, type Student } from '../../services/students.service';
import {
  enrollmentsApi,
  type EnrollmentStatus,
} from '../../services/enrollments.service';
import DashboardLayout from '../../layouts/DashboardLayout';
import EditClassDrawer from './EditClassDrawer';
import ClassActionsMenu from './ClassActionsMenu';
import './ClassesPage.css';
import './ClassDetailPage.css';

const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  ACTIVE: 'Hoạt động',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;
  const navigate = useNavigate();

  const [classItem, setClassItem] = useState<ClassItem | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [classEnrollments, setClassEnrollments] = useState<
    Array<{
      student: Student;
      status: EnrollmentStatus;
      enrollmentId: string;
      enrolledAt: string;
    }>
  >([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);

  const [enrollQuery, setEnrollQuery] = useState('');
  const [enrollStatusFilter, setEnrollStatusFilter] = useState('');

  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addStudentQuery, setAddStudentQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set(),
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [addingStudents, setAddingStudents] = useState(false);
  const [teacherPickerOpen, setTeacherPickerOpen] = useState(false);
  const [assigningTeacher, setAssigningTeacher] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);

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

  const loadEnrollments = useCallback(async () => {
    if (!id) return;
    setEnrollmentsLoading(true);
    try {
      const enrolled = await enrollmentsApi.findByClass(id, organizationId);
      setClassEnrollments(
        enrolled
          .filter((e) => e.student)
          .map((e) => ({
            student: e.student as Student,
            status: e.status,
            enrollmentId: e.id,
            enrolledAt: e.enrolledAt ?? e.createdAt ?? '',
          })),
      );
      setError(null);
    } catch {
      setError('Không thể tải danh sách học viên của lớp.');
    } finally {
      setEnrollmentsLoading(false);
    }
  }, [id, organizationId]);

  const loadAll = useCallback(async () => {
    if (!id) return;
    try {
      const [c, b, co, t] = await Promise.all([
        classApi.findOne(id, organizationId),
        branchApi.findAll(organizationId),
        courseApi.findAll(organizationId),
        teachersApi.findAll(organizationId),
      ]);
      setClassItem(c);
      setBranches(b);
      setCourses(co);
      setTeachers(t);
      setError(null);
    } catch {
      setError('Không thể tải thông tin lớp học.');
    }
    await loadEnrollments();
  }, [id, organizationId, loadEnrollments]);

  useEffect(() => {
    let active = true;
    if (!id) return;
    (async () => {
      try {
        const [c, b, co, t] = await Promise.all([
          classApi.findOne(id, organizationId),
          branchApi.findAll(organizationId),
          courseApi.findAll(organizationId),
          teachersApi.findAll(organizationId),
        ]);
        if (active) {
          setClassItem(c);
          setBranches(b);
          setCourses(co);
          setTeachers(t);
          setError(null);
        }
      } catch {
        if (active) setError('Không thể tải thông tin lớp học.');
      } finally {
        if (active) setLoading(false);
      }
      void loadEnrollments();
    })();
    return () => {
      active = false;
    };
  }, [id, organizationId, loadEnrollments]);

  const openAddStudent = async () => {
    setAddStudentQuery('');
    setSelectedStudentIds(new Set());
    try {
      const allStudents = await studentsApi.findAll(organizationId);
      setStudents(allStudents);
    } catch {
      setError('Không thể tải danh sách học viên.');
    }
    setAddStudentOpen(true);
  };

  const enrolledStudentIds = useMemo(
    () => new Set(classEnrollments.map((e) => e.student.id)),
    [classEnrollments],
  );

  const availableStudents = useMemo(() => {
    const q = addStudentQuery.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.status === 'ACTIVE' &&
        !enrolledStudentIds.has(s.id) &&
        (!q ||
          (s.user?.fullName ?? '').toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q)),
    );
  }, [students, enrolledStudentIds, addStudentQuery]);

  const displayEnrollments = useMemo(() => {
    const q = enrollQuery.trim().toLowerCase();
    return classEnrollments.filter(
      (e) =>
        (!enrollStatusFilter || e.status === enrollStatusFilter) &&
        (!q ||
          (e.student.user?.fullName ?? '').toLowerCase().includes(q) ||
          e.student.studentCode.toLowerCase().includes(q)),
    );
  }, [classEnrollments, enrollQuery, enrollStatusFilter]);

  const capacityPercent =
    classItem && classItem.capacity > 0
      ? Math.round((classEnrollments.length / classItem.capacity) * 100)
      : 0;

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const handleAssignTeacher = async (teacherId: string | null) => {
    if (!id || !classItem) return;
    setAssigningTeacher(true);
    setTeacherError(null);
    try {
      const updated = await classApi.update(
        id,
        { teacherId: teacherId ?? null },
        organizationId,
      );
      setClassItem(updated);
      setTeacherPickerOpen(false);
    } catch {
      setTeacherError('Gán giáo viên cho lớp thất bại.');
    } finally {
      setAssigningTeacher(false);
    }
  };

  const handleAddStudents = async () => {
    if (!id) return;
    setAddingStudents(true);
    try {
      for (const studentId of selectedStudentIds) {
        await enrollmentsApi.create(
          { studentId, classId: id },
          organizationId,
        );
      }
      setAddStudentOpen(false);
      await loadEnrollments();
    } catch {
      setError('Thêm học viên vào lớp thất bại.');
    } finally {
      setAddingStudents(false);
    }
  };

  return (
    <DashboardLayout       activeLabel="Lớp học">
      <div className="dashboard-content class-detail-content">
        <button
          type="button"
          className="class-back"
          onClick={() => navigate('/classes')}
        >
          ← Quay lại danh sách lớp
        </button>

        {error && <div className="class-detail-error">{error}</div>}
        {loading && !classItem && !error && (
          <div className="class-detail-loading">Đang tải...</div>
        )}

        {!loading && classItem && (
          <>
            <div className="class-hero">
              <div className="class-hero-main">
                <div className="class-hero-title-row">
                  <h1>{classItem.name}</h1>
                  <span
                    className={`class-hero-status ${(classItem.lifecycleStatus ?? '').toLowerCase()}`}
                  >
                    {classItem.lifecycleStatus === 'UPCOMING'
                      ? 'Sắp diễn ra'
                      : classItem.lifecycleStatus === 'ONGOING'
                        ? 'Đang diễn ra'
                        : classItem.lifecycleStatus === 'COMPLETED'
                          ? 'Hoàn thành'
                          : classItem.lifecycleStatus === 'CANCELLED'
                            ? 'Đã hủy'
                            : '—'}
                  </span>
                </div>
                <p className="class-hero-sub">
                  {classItem.code} · {courseMap.get(classItem.courseId)?.name ?? '—'} ·{' '}
                  {branchMap.get(classItem.branchId)?.name ?? '—'}
                </p>
              </div>
              <div className="class-hero-actions">
                <button
                  type="button"
                  className="class-edit-btn"
                  onClick={() => setDrawerOpen(true)}
                >
                  Chỉnh sửa lớp
                </button>                <ClassActionsMenu
                  classItem={classItem}
                  organizationId={organizationId}
                  onAction={(action) => {
                    if (action === 'delete') {
                      navigate('/classes');
                    } else {
                      void loadAll();
                    }
                  }}
                />
              </div>
            </div>

            <div className="class-meta">
              <div className="class-meta-card">
                <span className="class-meta-label">Học viên</span>
                <strong className="class-meta-value">
                  {enrollmentsLoading ? '…' : `${classEnrollments.length} / ${classItem.capacity}`}
                </strong>
                <small className="class-meta-hint">
                  {capacityPercent}% sức chứa
                </small>
              </div>
              <button
                type="button"
                className="class-meta-card class-meta-link"
                onClick={() => {
                  if (classItem.teacherId) {
                    navigate(
                      `/teachers/${classItem.teacherId}${
                        organizationId
                          ? `?organizationId=${organizationId}`
                          : ''
                      }`,
                    );
                  } else {
                    setTeacherPickerOpen(true);
                  }
                }}
              >
                <span className="class-meta-label">Giáo viên</span>
                {classItem.teacherId ? (
                  <div className="class-teacher-cell">
                    <span className="class-student-avatar">
                      {teacherMap.get(classItem.teacherId)?.user?.avatarUrl ? (
                        <img
                          src={teacherMap.get(classItem.teacherId)?.user?.avatarUrl ?? ''}
                          alt=""
                        />
                      ) : (
                        '👤'
                      )}
                    </span>
                    <div>
                      <strong className="class-teacher-name">
                        {teacherMap.get(classItem.teacherId)?.user?.fullName ?? '—'}
                      </strong>
                      <small className="class-teacher-role">
                        Giảng viên
                      </small>
                    </div>
                  </div>
                ) : (
                  <strong className="class-meta-value">Chưa có giáo viên</strong>
                )}
                <small className="class-meta-hint">
                  {classItem.teacherId ? 'Xem hồ sơ →' : 'Gán giáo viên →'}
                </small>
              </button>
              <button
                type="button"
                className="class-meta-card class-meta-link"
                onClick={() =>
                  navigate(
                    `/classes/${id}/schedule${
                      organizationId ? `?organizationId=${organizationId}` : ''
                    }`,
                  )
                }
              >
                <span className="class-meta-label">Lịch học</span>
                <strong className="class-meta-value">Xem lịch</strong>
                <small className="class-meta-hint">Quản lý buổi học hằng tuần →</small>
              </button>
            </div>

            <section className="class-students-panel">
              <div className="class-students-head">
                <h2>Học viên</h2>
                <button
                  type="button"
                  className="classes-add-small"
                  onClick={openAddStudent}
                >
                  + Thêm học viên
                </button>
              </div>

              <div className="class-toolbar">
                <div className="class-toolbar-search">
                  <span>🔍</span>
                  <input
                    value={enrollQuery}
                    onChange={(e) => setEnrollQuery(e.target.value)}
                    placeholder="Tìm kiếm học viên..."
                    aria-label="Tìm kiếm học viên"
                  />
                </div>
                <select
                  className="class-toolbar-select"
                  value={enrollStatusFilter}
                  onChange={(e) => setEnrollStatusFilter(e.target.value)}
                  aria-label="Lọc theo trạng thái"
                >
                  <option value="">Trạng thái</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>

              {enrollmentsLoading ? (
                <div className="classes-enroll-loading">Đang tải học viên...</div>
              ) : displayEnrollments.length === 0 ? (
                <div className="classes-enroll-empty">
                  Chưa có học viên nào trong lớp.
                </div>
              ) : (
                <div className="class-table-wrap">
                  <table className="class-table">
                    <thead>
                      <tr>
                        <th>Học viên</th>
                        <th>Mã số</th>
                        <th>Ngày tham gia</th>
                        <th>Trạng thái</th>
                        <th className="class-table-action">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayEnrollments.map((e) => (
                        <tr key={e.enrollmentId}>
                          <td>
                            <div className="class-student-cell">
                              <span className="class-student-avatar">
                                {e.student.user?.avatarUrl ? (
                                  <img src={e.student.user.avatarUrl} alt="" />
                                ) : (
                                  '👤'
                                )}
                              </span>
                              <span className="class-student-name">
                                {e.student.user?.fullName ?? '—'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="class-code">
                              {e.student.studentCode}
                            </span>
                          </td>
                          <td>
                            <span className="class-enrolled-date">
                              {e.enrolledAt
                                ? new Date(e.enrolledAt).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`class-status ${e.status.toLowerCase()}`}
                            >
                              {enrollmentStatusLabels[e.status]}
                            </span>
                          </td>
                          <td className="class-table-action">
                            <button
                              type="button"
                              className="class-row-menu"
                              aria-label="Thêm thao tác"
                            >
                              ⋯
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {addStudentOpen && (
          <div
            className="classes-modal-backdrop"
            onClick={() => setAddStudentOpen(false)}
          >
            <div
              className="classes-modal classes-add-student"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="classes-modal-header">
                <h3>Thêm học viên vào {classItem?.name}</h3>
                <button
                  type="button"
                  className="classes-modal-close"
                  onClick={() => setAddStudentOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="classes-add-search">
                <span>🔍</span>
                <input
                  value={addStudentQuery}
                  onChange={(e) => setAddStudentQuery(e.target.value)}
                  placeholder="Tìm học viên theo tên hoặc mã..."
                  aria-label="Tìm kiếm học viên"
                />
              </div>
              {availableStudents.length === 0 ? (
                <div className="classes-enroll-empty">
                  Không có học viên nào để thêm.
                </div>
              ) : (
                <ul className="classes-add-list">
                  {availableStudents.map((s) => (
                    <li key={s.id}>
                      <label className="classes-add-item">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.has(s.id)}
                          onChange={() => toggleStudent(s.id)}
                        />
                        <span className="class-student-avatar">
                          {s.user?.avatarUrl ? (
                            <img src={s.user.avatarUrl} alt="" />
                          ) : (
                            '👤'
                          )}
                        </span>
                        <span>
                          <strong>{s.user?.fullName ?? '—'}</strong>
                          <small>{s.studentCode}</small>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              <div className="classes-modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setAddStudentOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAddStudents}
                  disabled={addingStudents || selectedStudentIds.size === 0}
                >
                  {addingStudents
                    ? 'Đang thêm...'
                    : `Thêm ${selectedStudentIds.size || ''}`.trim()}
                </button>
              </div>
            </div>
          </div>
        )}

        {teacherPickerOpen && classItem && (
          <div
            className="classes-modal-backdrop"
            onClick={() => setTeacherPickerOpen(false)}
          >
            <div
              className="classes-modal classes-assign-teacher"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="classes-modal-header">
                <h3>Gán giáo viên cho {classItem.name}</h3>
                <button
                  type="button"
                  className="classes-modal-close"
                  onClick={() => setTeacherPickerOpen(false)}
                >
                  ✕
                </button>
              </div>
              {teacherError && (
                <div className="classes-form-error">{teacherError}</div>
              )}
              {teachers.length === 0 ? (
                <div className="classes-enroll-empty">
                  Không có giáo viên nào.
                </div>
              ) : (
                <ul className="classes-add-list">
                  {teachers.map((t) => (
                    <li key={t.id}>
                      <label className="classes-add-item">
                        <input
                          type="radio"
                          name="assignTeacher"
                          checked={classItem.teacherId === t.id}
                          onChange={() => handleAssignTeacher(t.id)}
                          disabled={assigningTeacher}
                        />
                        <span className="class-student-avatar">
                          {t.user?.avatarUrl ? (
                            <img src={t.user.avatarUrl} alt="" />
                          ) : (
                            '👤'
                          )}
                        </span>
                        <span>
                          <strong>{t.user?.fullName ?? '—'}</strong>
                          <small>{t.teacherCode}</small>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              <div className="classes-modal-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setTeacherPickerOpen(false)}
                >
                  Hủy
                </button>
                {classItem.teacherId && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => handleAssignTeacher(null)}
                    disabled={assigningTeacher}
                  >
                    {assigningTeacher ? 'Đang gỡ...' : 'Gỡ giáo viên'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {drawerOpen && classItem && (
          <EditClassDrawer
            classItem={classItem}
            organizationId={organizationId}
            onClose={() => setDrawerOpen(false)}
            onSaved={(updated) => {
              setClassItem(updated);
              setDrawerOpen(false);
              void loadEnrollments();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default ClassDetailPage;