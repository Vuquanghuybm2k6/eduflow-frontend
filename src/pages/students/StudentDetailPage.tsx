import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { studentsApi, type Student } from '../../services/students.service';
import { branchApi, type Branch } from '../../services/branch.service';
import StudentFormModal from './StudentFormModal';
import DashboardLayout from '../../layouts/DashboardLayout';
import './StudentsPage.css';
import './StudentDetailPage.css';

const genderLabels: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
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
    <DashboardLayout activeLabel="Students">
      <div className="dashboard-content student-detail-content">
        <button
          type="button"
          className="student-back"
          onClick={() => navigate('/students')}
        >
          ← Back to Students
        </button>

        {error && <div className="student-detail-error">{error}</div>}
        {loading && (!student || !error) && (
          <div className="student-detail-loading">Loading...</div>
        )}

        {!loading && student && (
          <>
            <div className="student-heading">
              <div>
                <h1>Student Profile</h1>
                <small>View and manage student information</small>
              </div>
              <button
                type="button"
                className="student-edit-btn"
                onClick={() => setEditOpen(true)}
              >
                Edit
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
                    {student.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="student-info-grid">
              <section className="student-info-card">
                <h3>Personal Information</h3>
                <div className="student-info-row">
                  <span>Email</span>
                  <strong>{student.user?.email ?? '—'}</strong>
                </div>
                <div className="student-info-row">
                  <span>Phone</span>
                  <strong>{student.user?.phone ?? '—'}</strong>
                </div>
              </section>

              <section className="student-info-card">
                <h3>Student Information</h3>
                <div className="student-info-row">
                  <span>Date of birth</span>
                  <strong>
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth)
                          .toISOString()
                          .slice(0, 10)
                      : '—'}
                  </strong>
                </div>
                <div className="student-info-row">
                  <span>Gender</span>
                  <strong>
                    {student.gender
                      ? genderLabels[student.gender] ?? student.gender
                      : '—'}
                  </strong>
                </div>
                <div className="student-info-row">
                  <span>Branches</span>
                  <strong>
                    {(student.branches ?? []).length > 0
                      ? student.branches!.map((b) => b.name).join(', ')
                      : '—'}
                  </strong>
                </div>
                {student.address && (
                  <div className="student-info-row">
                    <span>Address</span>
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