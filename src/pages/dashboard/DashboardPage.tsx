import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import DashboardLayout from '../../layouts/DashboardLayout';
import { studentsApi, type Student } from '../../services/students.service';
import { teachersApi, type Teacher } from '../../services/teachers.service';
import { classApi, type ClassItem } from '../../services/class.service';
import './DashboardPage.css';

const activityTones = ['purple', 'green', 'blue', 'orange'];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length
    ? words
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    : 'NA';
}

function DashboardPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;
  const navigate = useNavigate();
  const firstName = user?.fullName?.trim().split(/\s+/).at(-1) ?? 'bạn';

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [recentCount, setRecentCount] = useState(0);
  const [recentTeacherCount, setRecentTeacherCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, t, c] = await Promise.all([
          studentsApi.findAll(organizationId),
          teachersApi.findAll(organizationId),
          classApi.findAll(organizationId),
        ]);
        if (active) {
          setStudents(s);
          setTeachers(t);
          setClasses(c);
          const monthMs = 30 * 24 * 60 * 60 * 1000;
          const now = Date.now();
          setRecentCount(
            s.filter(
              (item) => now - new Date(item.createdAt).getTime() < monthMs,
            ).length,
          );
          setRecentTeacherCount(
            t.filter(
              (item) => now - new Date(item.createdAt).getTime() < monthMs,
            ).length,
          );
        }
      } catch {
        if (active) setError('Không thể tải dữ liệu.');
      }
    })();
    return () => {
      active = false;
    };
  }, [organizationId]);

  const stats = useMemo(() => {
    const activeClasses = classes.filter(
      (c) => c.status === 'ACTIVE' || c.status === 'UPCOMING',
    ).length;

    return [
      { label: 'Tổng học viên', value: students.length.toLocaleString('vi-VN'), change: `+${recentCount}`, em: 'trong 30 ngày qua', icon: '◎', tone: 'indigo' },
      { label: 'Giáo viên', value: teachers.length.toLocaleString('vi-VN'), change: `+${recentTeacherCount}`, em: 'trong 30 ngày qua', icon: '♙', tone: 'blue' },
      { label: 'Lớp đang hoạt động', value: activeClasses.toLocaleString('vi-VN'), change: `+${activeClasses}`, em: 'lớp mở', icon: '▣', tone: 'orange' },
      { label: 'Tỷ lệ chuyên cần', value: '94.8%', change: '+1.2%', em: 'so với tháng trước', icon: '✓', tone: 'green' },
    ];
  }, [students, teachers, classes, recentCount, recentTeacherCount]);

  const activities = useMemo(
    () =>
      [...students]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5)
        .map((s, i) => ({
          key: s.id,
          initials: initialsOf(s.user?.fullName ?? ''),
          text: `${s.user?.fullName ?? 'Học viên'} vừa được thêm vào hệ thống (${s.studentCode})`,
          time: timeAgo(s.createdAt),
          tone: activityTones[i % activityTones.length],
        })),
    [students],
  );

  return (
    <DashboardLayout activeLabel="Dashboard">
      <div className="dashboard-content">
        <div className="page-heading"><div><p>Thứ Ba, 28 tháng 8, 2026</p><h1>Chào mừng trở lại, {firstName} <span>👋</span></h1><small>Đây là những gì đang diễn ra tại tổ chức của bạn hôm nay.</small></div><button className="add-student" type="button" onClick={() => navigate('/students')}>＋ Thêm học viên</button></div>

        {error && <div className="students-error">{error}</div>}

        <section className="stats-grid">
          {stats.map((stat) => <article key={stat.label} className="stat-card"><div className={`stat-icon ${stat.tone}`}>{stat.icon}</div><div><p>{stat.label}</p><strong>{stat.value}</strong><small className="positive">↗ {stat.change} <em>{stat.em}</em></small></div></article>)}
        </section>

        <section className="dashboard-grid">
          <article className="panel growth-panel"><div className="panel-header"><div><h2>Tăng trưởng học viên</h2><p>Số học viên mới trong 6 tháng gần đây</p></div><button type="button">6 tháng ⌄</button></div><div className="chart-area"><div className="chart-y"><span>300</span><span>200</span><span>100</span><span>0</span></div><div className="line-chart"><svg viewBox="0 0 640 225" preserveAspectRatio="none" aria-label="Biểu đồ tăng trưởng học viên"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#818cf8" stopOpacity=".3"/><stop offset="100%" stopColor="#818cf8" stopOpacity="0"/></linearGradient></defs><path d="M0 178 C40 162,55 169,94 145 S155 154,190 125 S247 139,284 99 S344 121,380 86 S439 99,474 57 S534 79,570 38 S618 47,640 20 L640 225 L0 225Z" fill="url(#area)"/><path d="M0 178 C40 162,55 169,94 145 S155 154,190 125 S247 139,284 99 S344 121,380 86 S439 99,474 57 S534 79,570 38 S618 47,640 20" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round"/></svg><div className="chart-months"><span>Th3</span><span>Th4</span><span>Th5</span><span>Th6</span><span>Th7</span><span>Th8</span></div></div></div></article>
          <article className="panel classes-panel"><div className="panel-header"><div><h2>Lớp học hôm nay</h2><p>4 lớp đang diễn ra</p></div><button type="button" className="text-button">Xem tất cả</button></div><div className="class-list"><div><span className="class-time">08:00</span><span className="class-mark indigo"></span><p><strong>Toán nâng cao</strong><small>Lớp 10A1 · Phòng A203</small></p><b>28/30</b></div><div><span className="class-time">09:30</span><span className="class-mark blue"></span><p><strong>Tiếng Anh giao tiếp</strong><small>Lớp 11B2 · Phòng B104</small></p><b>24/25</b></div><div><span className="class-time">13:30</span><span className="class-mark orange"></span><p><strong>Vật lý cơ bản</strong><small>Lớp 9C1 · Phòng A105</small></p><b>29/32</b></div></div></article>
          <article className="panel attendance-panel"><div className="panel-header"><div><h2>Chuyên cần tuần này</h2><p>So sánh tỷ lệ có mặt mỗi ngày</p></div><span className="attendance-value">94.8%</span></div><div className="attendance-chart">{[78, 92, 84, 96, 88, 66, 48].map((value, index) => <div key={value}><i style={{ height: `${value}%` }}></i><span>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}</span></div>)}</div></article>
          <article className="panel activity-panel"><div className="panel-header"><div><h2>Hoạt động gần đây</h2><p>Cập nhật mới nhất trong tổ chức</p></div><button type="button" className="text-button" onClick={() => navigate('/students')}>Xem tất cả</button></div><div className="activity-list">{activities.length === 0 ? <p className="activity-empty">Chưa có học viên nào.</p> : activities.map((activity) => <div key={activity.key}><span className={`activity-avatar ${activity.tone}`}>{activity.initials}</span><p><strong>{activity.text}</strong><small>{activity.time}</small></p></div>)}</div></article>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
