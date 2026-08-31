import { useAuthStore } from '../../stores/auth.store';
import DashboardLayout from '../../layouts/DashboardLayout';
import './DashboardPage.css';

const stats = [
  { label: 'Tổng học viên', value: '1,284', change: '+8.2%', icon: '◎', tone: 'indigo' },
  { label: 'Giáo viên', value: '86', change: '+3.4%', icon: '♙', tone: 'blue' },
  { label: 'Lớp đang hoạt động', value: '24', change: '+2 lớp', icon: '▣', tone: 'orange' },
  { label: 'Tỷ lệ chuyên cần', value: '94.8%', change: '+1.2%', icon: '✓', tone: 'green' },
];

const activities = [
  ['NA', 'Nguyễn An vừa được thêm vào lớp 10A1', '5 phút trước', 'purple'],
  ['TL', 'Trần Linh đã thanh toán học phí tháng 8', '18 phút trước', 'green'],
  ['HP', 'Hoàng Phúc nộp bài kiểm tra Toán', '42 phút trước', 'blue'],
  ['MN', 'Mai Ngọc được đánh dấu vắng mặt', '1 giờ trước', 'orange'],
];

function DashboardPage() {
  const { user } = useAuthStore();
  const firstName = user?.fullName?.trim().split(/\s+/).at(-1) ?? 'bạn';

  return (
    <DashboardLayout activeLabel="Dashboard">
      <div className="dashboard-content">
        <div className="page-heading"><div><p>Thứ Ba, 28 tháng 8, 2026</p><h1>Chào mừng trở lại, {firstName} <span>👋</span></h1><small>Đây là những gì đang diễn ra tại tổ chức của bạn hôm nay.</small></div><button className="add-student" type="button">＋ Thêm học viên</button></div>

        <section className="stats-grid">
          {stats.map((stat) => <article key={stat.label} className="stat-card"><div className={`stat-icon ${stat.tone}`}>{stat.icon}</div><div><p>{stat.label}</p><strong>{stat.value}</strong><small className="positive">↗ {stat.change} <em>so với tháng trước</em></small></div></article>)}
        </section>

        <section className="dashboard-grid">
          <article className="panel growth-panel"><div className="panel-header"><div><h2>Tăng trưởng học viên</h2><p>Số học viên mới trong 6 tháng gần đây</p></div><button type="button">6 tháng ⌄</button></div><div className="chart-area"><div className="chart-y"><span>300</span><span>200</span><span>100</span><span>0</span></div><div className="line-chart"><svg viewBox="0 0 640 225" preserveAspectRatio="none" aria-label="Biểu đồ tăng trưởng học viên"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#818cf8" stopOpacity=".3"/><stop offset="100%" stopColor="#818cf8" stopOpacity="0"/></linearGradient></defs><path d="M0 178 C40 162,55 169,94 145 S155 154,190 125 S247 139,284 99 S344 121,380 86 S439 99,474 57 S534 79,570 38 S618 47,640 20 L640 225 L0 225Z" fill="url(#area)"/><path d="M0 178 C40 162,55 169,94 145 S155 154,190 125 S247 139,284 99 S344 121,380 86 S439 99,474 57 S534 79,570 38 S618 47,640 20" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round"/></svg><div className="chart-months"><span>Th3</span><span>Th4</span><span>Th5</span><span>Th6</span><span>Th7</span><span>Th8</span></div></div></div></article>
          <article className="panel classes-panel"><div className="panel-header"><div><h2>Lớp học hôm nay</h2><p>4 lớp đang diễn ra</p></div><button type="button" className="text-button">Xem tất cả</button></div><div className="class-list"><div><span className="class-time">08:00</span><span className="class-mark indigo"></span><p><strong>Toán nâng cao</strong><small>Lớp 10A1 · Phòng A203</small></p><b>28/30</b></div><div><span className="class-time">09:30</span><span className="class-mark blue"></span><p><strong>Tiếng Anh giao tiếp</strong><small>Lớp 11B2 · Phòng B104</small></p><b>24/25</b></div><div><span className="class-time">13:30</span><span className="class-mark orange"></span><p><strong>Vật lý cơ bản</strong><small>Lớp 9C1 · Phòng A105</small></p><b>29/32</b></div></div></article>
          <article className="panel attendance-panel"><div className="panel-header"><div><h2>Chuyên cần tuần này</h2><p>So sánh tỷ lệ có mặt mỗi ngày</p></div><span className="attendance-value">94.8%</span></div><div className="attendance-chart">{[78, 92, 84, 96, 88, 66, 48].map((value, index) => <div key={value}><i style={{ height: `${value}%` }}></i><span>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}</span></div>)}</div></article>
          <article className="panel activity-panel"><div className="panel-header"><div><h2>Hoạt động gần đây</h2><p>Cập nhật mới nhất trong tổ chức</p></div><button type="button" className="text-button">Xem tất cả</button></div><div className="activity-list">{activities.map(([initials, text, time, color]) => <div key={text}><span className={`activity-avatar ${color}`}>{initials}</span><p><strong>{text}</strong><small>{time}</small></p></div>)}</div></article>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
