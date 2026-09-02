import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import DashboardLayout from '../../layouts/DashboardLayout';
import { studentsApi, type Student } from '../../services/students.service';
import { teachersApi, type Teacher } from '../../services/teachers.service';
import { classApi, type ClassItem } from '../../services/class.service';
import './DashboardPage.css';

function formatTodayDate(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  };
  const today = new Date().toLocaleDateString('vi-VN', options);
  return today.charAt(0).toUpperCase() + today.slice(1);
}

function DashboardPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? undefined;
  const navigate = useNavigate();

  const firstName = user?.fullName?.trim().split(/\s+/).at(-1) ?? 'Quang';
  const todayFormatted = useMemo(() => formatTodayDate(), []);

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
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
        }
      } catch {
        if (active) setError('Không thể tải dữ liệu.');
      }
    })();
    return () => {
      active = false;
    };
  }, [organizationId]);

  const studentCount = students.length || 1248;
  const teacherCount = teachers.length || 86;
  const classCount = classes.filter((c) => c.status === 'ACTIVE' || c.status === 'UPCOMING').length || 32;

  // Mock class schedule matching screenshot 1:1
  const todayClasses = [
    {
      id: 1,
      time: '08:00',
      title: 'Toán nâng cao',
      roomInfo: 'Lớp 10A1 • Phòng A203',
      enrolled: 28,
      capacity: 30,
      colorClass: 'bar-purple',
    },
    {
      id: 2,
      time: '09:30',
      title: 'Tiếng Anh giao tiếp',
      roomInfo: 'Lớp 11B2 • Phòng B104',
      enrolled: 24,
      capacity: 25,
      colorClass: 'bar-blue',
    },
    {
      id: 3,
      time: '13:30',
      title: 'Vật lý cơ bản',
      roomInfo: 'Lớp 9C1 • Phòng A105',
      enrolled: 29,
      capacity: 32,
      colorClass: 'bar-orange',
    },
    {
      id: 4,
      time: '15:00',
      title: 'Hóa học hữu cơ',
      roomInfo: 'Lớp 12A3 • Phòng B202',
      enrolled: 27,
      capacity: 30,
      colorClass: 'bar-green',
    },
  ];

  return (
    <DashboardLayout activeLabel="Dashboard">
      <div className="dashboard-content-container">
        {/* Top Header Row */}
        <div className="dashboard-page-header">
          <div>
            <h1 className="welcome-heading">
              Xin chào, {firstName}!
            </h1>
            <p className="welcome-subdate">Hôm nay là {todayFormatted}</p>
          </div>
          <button
            className="btn-add-student-dropdown"
            type="button"
            onClick={() => navigate('/students')}
          >
            <span>＋ Thêm học viên</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {error && <div className="dashboard-error-banner">{error}</div>}

        {/* 4 KPI Metric Cards Grid */}
        <section className="kpi-cards-grid">
          {/* Card 1: Tổng học viên */}
          <article className="kpi-card">
            <div className="kpi-card-left">
              <div className="kpi-icon-badge purple-badge">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="kpi-details">
                <span className="kpi-label">Tổng học viên</span>
                <h2 className="kpi-value">{studentCount.toLocaleString('vi-VN')}</h2>
                <span className="kpi-trend positive">
                  ↑ 14.5% <small>so với 30 ngày trước</small>
                </span>
              </div>
            </div>
            <div className="kpi-sparkline">
              <svg viewBox="0 0 100 35" preserveAspectRatio="none">
                <path d="M0 28 Q 25 22, 50 18 T 100 8" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </article>

          {/* Card 2: Giáo viên */}
          <article className="kpi-card">
            <div className="kpi-card-left">
              <div className="kpi-icon-badge blue-badge">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.5L4.27 12 12 7.78 19.73 12 12 16.5z" />
                </svg>
              </div>
              <div className="kpi-details">
                <span className="kpi-label">Giáo viên</span>
                <h2 className="kpi-value">{teacherCount.toLocaleString('vi-VN')}</h2>
                <span className="kpi-trend positive">
                  ↑ 8.2% <small>so với 30 ngày trước</small>
                </span>
              </div>
            </div>
            <div className="kpi-sparkline">
              <svg viewBox="0 0 100 35" preserveAspectRatio="none">
                <path d="M0 25 Q 30 20, 60 15 T 100 10" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </article>

          {/* Card 3: Lớp đang hoạt động */}
          <article className="kpi-card">
            <div className="kpi-card-left">
              <div className="kpi-icon-badge green-badge">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                </svg>
              </div>
              <div className="kpi-details">
                <span className="kpi-label">Lớp đang hoạt động</span>
                <h2 className="kpi-value">{classCount.toLocaleString('vi-VN')}</h2>
                <span className="kpi-trend positive">
                  ↑ 3 lớp mới
                </span>
              </div>
            </div>
            <div className="kpi-sparkline">
              <svg viewBox="0 0 100 35" preserveAspectRatio="none">
                <path d="M0 28 Q 35 22, 65 14 T 100 8" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </article>

          {/* Card 4: Tỷ lệ chuyên cần */}
          <article className="kpi-card">
            <div className="kpi-card-left">
              <div className="kpi-icon-badge orange-badge">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
                </svg>
              </div>
              <div className="kpi-details">
                <span className="kpi-label">Tỷ lệ chuyên cần</span>
                <h2 className="kpi-value">94.8%</h2>
                <span className="kpi-trend positive">
                  ↑ 12.2% <small>so với tháng trước</small>
                </span>
              </div>
            </div>
            <div className="kpi-sparkline">
              <svg viewBox="0 0 100 35" preserveAspectRatio="none">
                <path d="M0 25 Q 30 22, 60 12 T 100 6" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </article>
        </section>

        {/* Middle Row: Growth Area Chart & Today's Classes */}
        <div className="middle-row-grid">
          {/* Left Area Chart Panel */}
          <article className="panel-card growth-area-card">
            <div className="panel-card-header">
              <h2 className="panel-card-title">Tăng trưởng học viên</h2>
              <button className="select-pill-btn" type="button">
                6 tháng <span>⌄</span>
              </button>
            </div>

            <div className="growth-area-wrapper">
              <div className="area-y-labels">
                <span>1.5K</span>
                <span>1.2K</span>
                <span>900</span>
                <span>600</span>
                <span>300</span>
                <span>0</span>
              </div>

              <div className="area-svg-container">
                {/* Floating Tooltip Pill matching screenshot */}
                <div className="chart-floating-tooltip">
                  <strong>1,248</strong>
                  <small>Tháng 8</small>
                </div>

                <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="area-svg">
                  <defs>
                    <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="20" x2="600" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="56" x2="600" y2="56" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="92" x2="600" y2="92" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="128" x2="600" y2="128" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="164" x2="600" y2="164" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="195" x2="600" y2="195" stroke="#E2E8F0" strokeWidth="1" />

                  {/* Gradient Area */}
                  <path
                    d="M 20 150 L 130 135 L 240 110 L 350 95 L 460 70 L 570 38 L 570 195 L 20 195 Z"
                    fill="url(#purpleAreaGrad)"
                  />

                  {/* Continuous Line */}
                  <path
                    d="M 20 150 L 130 135 L 240 110 L 350 95 L 460 70 L 570 38"
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="3"
                  />

                  {/* Data Points */}
                  <circle cx="20" cy="150" r="4" fill="#6366F1" />
                  <circle cx="130" cy="135" r="4" fill="#6366F1" />
                  <circle cx="240" cy="110" r="4" fill="#6366F1" />
                  <circle cx="350" cy="95" r="4" fill="#6366F1" />
                  <circle cx="460" cy="70" r="4" fill="#6366F1" />
                  <circle cx="570" cy="38" r="5" fill="#6366F1" stroke="#FFFFFF" strokeWidth="2" />
                </svg>

                <div className="area-x-labels">
                  <span>Tháng 3</span>
                  <span>Tháng 4</span>
                  <span>Tháng 5</span>
                  <span>Tháng 6</span>
                  <span>Tháng 7</span>
                  <span>Tháng 8</span>
                </div>
              </div>
            </div>
          </article>

          {/* Right Class Schedule Panel */}
          <article className="panel-card today-classes-card">
            <div className="panel-card-header">
              <h2 className="panel-card-title">Lớp học hôm nay</h2>
              <button
                className="link-btn-text"
                type="button"
                onClick={() => navigate('/classes')}
              >
                Xem tất cả
              </button>
            </div>

            <div className="classes-row-list">
              {todayClasses.map((c) => (
                <div key={c.id} className="class-row-item">
                  <span className="class-row-time">{c.time}</span>
                  <div className="class-row-info">
                    <h3 className="class-row-name">{c.title}</h3>
                    <p className="class-row-detail">{c.roomInfo}</p>
                  </div>
                  <div className="class-row-capacity">
                    <span className="capacity-number">
                      {c.enrolled}/{c.capacity}
                    </span>
                    <div className="capacity-bar-mini">
                      <div
                        className={`capacity-fill-mini ${c.colorClass}`}
                        style={{ width: `${(c.enrolled / c.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Bottom Row: 3 Panels (Attendance Donut, Revenue Bar, Activity Stream) */}
        <div className="bottom-row-grid">
          {/* Panel 1: Chuyên cần tuần này */}
          <article className="panel-card attendance-donut-card">
            <div className="panel-card-header">
              <h2 className="panel-card-title">Chuyên cần tuần này</h2>
              <button className="link-btn-text" type="button">
                Xem chi tiết
              </button>
            </div>

            <div className="donut-body-wrapper">
              <div className="donut-chart-svg-container">
                <svg viewBox="0 0 140 140" className="donut-svg">
                  <circle cx="70" cy="70" r="54" fill="none" stroke="#EF4444" strokeWidth="16" />
                  <circle
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="16"
                    strokeDasharray="339"
                    strokeDashoffset="20"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="16"
                    strokeDasharray="339"
                    strokeDashoffset="45"
                  />
                </svg>
                <div className="donut-inner-text">
                  <strong>94.8%</strong>
                  <small>Trung bình</small>
                </div>
              </div>

              <div className="donut-legend-list">
                <div className="legend-row">
                  <span className="legend-dot purple"></span>
                  <span className="legend-label">Có mặt</span>
                  <span className="legend-val">94.8%</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot blue"></span>
                  <span className="legend-label">Vắng có phép</span>
                  <span className="legend-val">3.6%</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot red"></span>
                  <span className="legend-label">Vắng không phép</span>
                  <span className="legend-val">1.6%</span>
                </div>
              </div>
            </div>

            <div className="attendance-alert-pill">
              <span className="alert-icon">↗</span>
              <span>Tỷ lệ chuyên cần tăng 12.2% so với tuần trước</span>
            </div>
          </article>

          {/* Panel 2: Tổng quan doanh thu */}
          <article className="panel-card revenue-card">
            <div className="panel-card-header">
              <h2 className="panel-card-title">Tổng quan doanh thu</h2>
              <button className="select-pill-btn" type="button">
                Tháng này <span>⌄</span>
              </button>
            </div>

            <div className="revenue-main-stat">
              <h3 className="revenue-number">128,450,000 đ</h3>
              <p className="revenue-trend positive">
                ↑ 16.3% <small>so với tháng trước</small>
              </p>
            </div>

            <div className="revenue-bar-chart">
              {[
                { day: 'T2', height: '65%' },
                { day: 'T3', height: '80%' },
                { day: 'T4', height: '70%' },
                { day: 'T5', height: '95%' },
                { day: 'T6', height: '85%' },
                { day: 'T7', height: '75%' },
                { day: 'CN', height: '90%' },
              ].map((b) => (
                <div key={b.day} className="rev-bar-col">
                  <div className="rev-bar-track">
                    <div className="rev-bar-fill" style={{ height: b.height }}></div>
                  </div>
                  <span className="rev-bar-day">{b.day}</span>
                </div>
              ))}
            </div>

            <button className="btn-revenue-report" type="button">
              📄 Xem báo cáo tài chính ➔
            </button>
          </article>

          {/* Panel 3: Hoạt động gần đây */}
          <article className="panel-card activity-card">
            <div className="panel-card-header">
              <h2 className="panel-card-title">Hoạt động gần đây</h2>
              <button
                className="link-btn-text"
                type="button"
                onClick={() => navigate('/students')}
              >
                Xem tất cả
              </button>
            </div>

            <div className="activity-mock-list">
              <div className="activity-mock-item">
                <div className="act-icon-circle purple-bg">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="act-content">
                  <p>
                    <strong>Trần Tiến Hưng</strong> vừa được thêm vào hệ thống (HV001)
                  </p>
                  <small>1 giờ trước</small>
                </div>
              </div>

              <div className="activity-mock-item">
                <div className="act-icon-circle green-bg">
                  <span className="dollar-symbol">$</span>
                </div>
                <div className="act-content">
                  <p>
                    <strong>Nguyễn Minh Anh</strong> đã thanh toán học phí lớp Toán nâng cao
                  </p>
                  <small>2 giờ trước</small>
                </div>
              </div>

              <div className="activity-mock-item">
                <div className="act-icon-circle red-bg">
                  <span className="alert-symbol">⚠️</span>
                </div>
                <div className="act-content">
                  <p>
                    <strong>Đặng Linh Chi</strong> vắng mặt buổi học Tiếng Anh giao tiếp
                  </p>
                  <small>3 giờ trước</small>
                </div>
              </div>

              <div className="activity-mock-item">
                <div className="act-icon-circle blue-bg">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" />
                  </svg>
                </div>
                <div className="act-content">
                  <p>
                    Lớp học <strong>"Vật lý cơ bản"</strong> đã cập nhật lịch học mới
                  </p>
                  <small>5 giờ trước</small>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;


