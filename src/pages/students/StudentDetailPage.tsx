import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { studentsApi, type Student } from '../../services/students.service';
import { branchApi, type Branch } from '../../services/branch.service';
import StudentFormModal from './StudentFormModal';
import DashboardLayout from '../../layouts/DashboardLayout';
import './StudentsPage.css';
import './StudentDetailPage.css';

const genderLabels: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const load = async (s?: Student) => {
    if (s) setStudent(s);
    try {
      const b = await branchApi.findAll(organizationId);
      setBranches(b);
      setError(null);
    } catch {
      setError('Không thể tải dữ liệu liên quan.');
    }
  };

  useEffect(() => {
    let active = true;
    if (!id) return;
    (async () => {
      try {
        const [s, b] = await Promise.all([
          studentsApi.findOne(id, organizationId),
          branchApi.findAll(organizationId),
        ]);
        if (active) {
          setStudent(s);
          setBranches(b);
          setError(null);
        }
      } catch {
        if (active) setError('Không thể tải thông tin học viên.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, organizationId]);

  const handleSaved = (saved: Student) => {
    setEditOpen(false);
    setStudent(saved);
    void load(saved);
  };

  return (
    <DashboardLayout       activeLabel="Học viên">
      <div className="dashboard-content student-detail-content">
        <button
          type="button"
          className="student-back"
          onClick={() => navigate('/students')}
        >
          ← Quay lại danh sách học viên
        </button>

        {error && <div className="student-detail-error">{error}</div>}
        {loading && (!student || !error) && (
          <div className="student-detail-loading">Đang tải...</div>
        )}

        {!loading && student && (
          <>
            <div className="student-heading">
              <div>
                <h1>Hồ sơ học viên</h1>
                <small>Xem và quản lý thông tin học viên</small>
              </div>
              <button
                type="button"
                className="student-edit-btn"
                onClick={() => setEditOpen(true)}
              >
                Sửa
              </button>
            </div>

            <div className="student-card">
              <div className="student-card-avatar">
                {student.user?.avatarUrl ? (
                  <img src={student.user.avatarUrl} alt="" />
                ) : (
                  '👤'
                )}
              </div>
              <div className="student-card-main">
                <h2>{student.user?.fullName ?? '—'}</h2>
                <div className="student-card-meta">
                  <span className="students-code">{student.studentCode}</span>
                  <span
                    className={`student-status ${student.status.toLowerCase()}`}
                  >
                    {student.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </div>
              </div>
            </div>

            <div className="student-info-grid">
              <section className="student-info-card">
                <h3>Thông tin cá nhân</h3>
                <div className="student-info-row">
                  <span>Email</span>
                  <strong>{student.user?.email ?? '—'}</strong>
                </div>
                <div className="student-info-row">
                  <span>Điện thoại</span>
                  <strong>{student.user?.phone ?? '—'}</strong>
                </div>
              </section>

              <section className="student-info-card">
                <h3>Thông tin học viên</h3>
                <div className="student-info-row">
                  <span>Ngày sinh</span>
                  <strong>
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth)
                          .toISOString()
                          .slice(0, 10)
                      : '—'}
                  </strong>
                </div>
                <div className="student-info-row">
                  <span>Giới tính</span>
                  <strong>
                    {student.gender
                      ? genderLabels[student.gender] ?? student.gender
                      : '—'}
                  </strong>
                </div>
                <div className="student-info-row">
                  <span>Chi nhánh</span>
                  <strong>
                    {(student.branches ?? []).length > 0
                      ? student.branches!.map((b) => b.name).join(', ')
                      : '—'}
                  </strong>
                </div>
                {student.address && (
                  <div className="student-info-row">
                    <span>Địa chỉ</span>
                    <strong>{student.address}</strong>
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        {editOpen && student && (
          <StudentFormModal
            student={student}
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

export default StudentDetailPage;