import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import DashboardLayout from '../../layouts/DashboardLayout';
import './ProfilePage.css';

type TabType = 'personal' | 'password' | 'notifications' | 'security' | 'activity';

interface ActivityItem {
  id: string;
  type: 'login' | 'profile' | 'password' | 'settings';
  title: string;
  time: string;
  location: string;
  browser: string;
  iconBg: 'green' | 'blue' | 'purple' | 'orange';
}

function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  // Form states initialized with user data or defaults matching screenshot
  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Huy Vũ Quang',
    dob: '29/04/2006',
    email: user?.email || 'quanghuy@gmail.com',
    phone: user?.phone || '+84 123 456 789',
    role: 'School Admin',
    language: 'Tiếng Việt',
    address: 'Hà Nội, Việt Nam',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Initial calculation for avatar
  const initials = formData.fullName
    ? formData.fullName
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'HV';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    }, 500);
  };

  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'login',
      title: 'Đăng nhập thành công',
      time: '02/09/2026 09:45',
      location: 'Hà Nội, VN',
      browser: 'Chrome',
      iconBg: 'green',
    },
    {
      id: '2',
      type: 'profile',
      title: 'Cập nhật hồ sơ',
      time: '01/09/2026 16:30',
      location: 'Hà Nội, VN',
      browser: 'Chrome',
      iconBg: 'blue',
    },
    {
      id: '3',
      type: 'password',
      title: 'Đổi mật khẩu',
      time: '31/08/2026 11:20',
      location: 'Hà Nội, VN',
      browser: 'Chrome',
      iconBg: 'purple',
    },
    {
      id: '4',
      type: 'settings',
      title: 'Cập nhật cài đặt',
      time: '30/08/2026 14:15',
      location: 'Hà Nội, VN',
      browser: 'Chrome',
      iconBg: 'orange',
    },
    {
      id: '5',
      type: 'login',
      title: 'Đăng nhập thành công',
      time: '30/08/2026 08:10',
      location: 'Hà Nội, VN',
      browser: 'Safari',
      iconBg: 'green',
    },
  ];

  return (
    <DashboardLayout activeLabel="Hồ sơ cá nhân">
      <div className="profile-container">
        {/* 1. Header & Breadcrumb */}
        <div className="profile-header-section">
          <div className="profile-breadcrumb">
            <Link to="/dashboard">Dashboard</Link>
            <span className="profile-breadcrumb-separator">›</span>
            <span className="profile-breadcrumb-current">Hồ sơ cá nhân</span>
          </div>
          <h1 className="profile-page-title">Hồ sơ cá nhân</h1>
          <p className="profile-page-subtitle">
            Quản lý thông tin cá nhân và các tùy chọn tài khoản của bạn.
          </p>
        </div>

        {/* 2. Profile Overview Top Card */}
        <div className="profile-header-card">
          <div className="profile-header-left">
            <div className="profile-avatar-banner">
              <div className="profile-avatar-circle">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="profile-avatar-img" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <label className="avatar-camera-btn" title="Đổi ảnh đại diện">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </label>
            </div>

            <div className="profile-user-info">
              <div className="profile-name-row">
                <h2 className="profile-user-name">{formData.fullName}</h2>
                <span className="status-online-tag">
                  <span className="status-dot"></span>
                  Đang hoạt động
                </span>
              </div>

              <div className="profile-role-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile-role-icon">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>{formData.role}</span>
              </div>

              <div className="profile-meta-row">
                <div className="profile-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile-meta-icon">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>{formData.email}</span>
                </div>

                <div className="profile-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile-meta-icon">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{formData.phone}</span>
                </div>

                <div className="profile-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile-meta-icon">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{formData.dob}</span>
                </div>
              </div>

              <div className="profile-joined-text">Tham gia từ 01/03/2026</div>
            </div>
          </div>

          <button
            type="button"
            className="profile-edit-btn"
            onClick={() => setActiveTab('personal')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Chỉnh sửa hồ sơ
          </button>
        </div>

        {/* 3. Navigation Tabs Bar */}
        <div className="profile-tabs-nav">
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Thông tin cá nhân
          </button>
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Đổi mật khẩu
          </button>
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Thông báo
          </button>
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Bảo mật
          </button>
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Hoạt động đăng nhập
          </button>
        </div>

        {/* 4. Tab 1: Personal Info (3-Column Layout Matching Screenshot) */}
        {activeTab === 'personal' && (
          <div className="profile-grid-layout">
            {/* Column 1: Personal Information Form */}
            <div className="profile-section-card profile-card-form">
              <h3 className="card-section-title">Thông tin cá nhân</h3>
              <form onSubmit={handleSubmit}>
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="fullName">Họ và tên</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="form-input"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="dob">Ngày sinh</label>
                    <div className="form-input-wrapper">
                      <input
                        id="dob"
                        name="dob"
                        type="text"
                        className="form-input"
                        value={formData.dob}
                        onChange={handleInputChange}
                      />
                      <svg
                        className="form-input-icon"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Số điện thoại</label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="role">Chức vụ</label>
                    <select
                      id="role"
                      name="role"
                      className="form-select"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="School Admin">School Admin</option>
                      <option value="Teacher">Giảng viên</option>
                      <option value="Student">Học viên</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="language">Ngôn ngữ</label>
                    <select
                      id="language"
                      name="language"
                      className="form-select"
                      value={formData.language}
                      onChange={handleInputChange}
                    >
                      <option value="Tiếng Việt">Tiếng Việt</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="address">Địa chỉ</label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      className="form-input"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-save-changes"
                  disabled={isSaving}
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>

                {showSaveToast && (
                  <div className="save-toast-message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Đã lưu thay đổi thành công!
                  </div>
                )}
              </form>
            </div>

            {/* Column 2: Account Details */}
            <div className="profile-section-card profile-card-account">
              <h3 className="card-section-title">Thông tin tài khoản</h3>
              <div className="account-info-list">
                <div className="account-info-row">
                  <span className="account-label">Tên đăng nhập</span>
                  <span className="account-value">quanghuy_admin</span>
                </div>

                <div className="account-info-row">
                  <span className="account-label">Vai trò</span>
                  <span className="account-value">School Admin</span>
                </div>

                <div className="account-info-row">
                  <span className="account-label">Quyền truy cập</span>
                  <span className="badge-pill green">Đầy đủ</span>
                </div>

                <div className="account-info-row">
                  <span className="account-label">Trạng thái tài khoản</span>
                  <span className="badge-pill green">Hoạt động</span>
                </div>

                <div className="account-info-row">
                  <span className="account-label">Xác minh email</span>
                  <span className="badge-pill green">
                    Đã xác minh
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </div>

                <div className="account-info-row">
                  <span className="account-label">Xác minh số điện thoại</span>
                  <span className="badge-pill orange">
                    Chưa xác minh !
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Recent Activity */}
            <div className="profile-section-card profile-card-activity">
              <h3 className="card-section-title">Hoạt động gần đây</h3>
              <div className="activity-list">
                {recentActivities.map((act) => (
                  <div key={act.id} className="activity-item">
                    <div className="activity-item-left">
                      <div className={`activity-icon-badge ${act.iconBg}`}>
                        {act.type === 'login' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        )}
                        {act.type === 'profile' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        )}
                        {act.type === 'password' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                          </svg>
                        )}
                        {act.type === 'settings' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                        )}
                      </div>
                      <div className="activity-info">
                        <p className="activity-title">{act.title}</p>
                        <p className="activity-time">{act.time}</p>
                      </div>
                    </div>
                    <div className="activity-meta-right">
                      <div>{act.location}</div>
                      <div className="activity-device">{act.browser}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-view-all-activities"
                onClick={() => setActiveTab('activity')}
              >
                Xem tất cả hoạt động →
              </button>
            </div>
          </div>
        )}

        {/* 5. Sub-Tabs Views */}
        {activeTab === 'password' && (
          <div className="other-tab-content">
            <h3 className="card-section-title">Đổi mật khẩu</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('Đã cập nhật mật khẩu!'); }} style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="currentPassword">Mật khẩu hiện tại</label>
                <input
                  id="currentPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">Mật khẩu mới</label>
                <input
                  id="newPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-save-changes" style={{ marginTop: '8px' }}>
                Cập nhật mật khẩu
              </button>
            </form>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="other-tab-content">
            <h3 className="card-section-title">Cài đặt thông báo</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Quản lý các loại thông báo bạn muốn nhận qua Email và hệ thống.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Thông báo qua Email</span>
                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#6366f1' }} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Thông báo hoạt động lớp học</span>
                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#6366f1' }} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Cảnh báo đăng nhập lạ</span>
                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#6366f1' }} />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="other-tab-content">
            <h3 className="card-section-title">Bảo mật tài khoản</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '560px' }}>
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', fontWeight: 700 }}>Xác thực 2 yếu tố (2FA)</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Tăng cường bảo mật bằng mã xác thực ứng dụng.</p>
                </div>
                <button type="button" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', fontWeight: 700, fontSize: '13px', color: '#6366f1', cursor: 'pointer' }}>
                  Kích hoạt
                </button>
              </div>

              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', fontWeight: 700 }}>Phiên đăng nhập hiện tại</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Chrome trên Windows (Hà Nội, VN)</p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '9999px' }}>
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="other-tab-content">
            <h3 className="card-section-title">Nhật ký hoạt động đăng nhập</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px 16px' }}>Hoạt động</th>
                    <th style={{ padding: '12px 16px' }}>Thời gian</th>
                    <th style={{ padding: '12px 16px' }}>Vị trí</th>
                    <th style={{ padding: '12px 16px' }}>Trình duyệt / Thiết bị</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((act) => (
                    <tr key={act.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{act.title}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{act.time}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{act.location}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{act.browser}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
