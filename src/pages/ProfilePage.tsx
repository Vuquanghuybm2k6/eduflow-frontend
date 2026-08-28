import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import './DashboardPage.css';

function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const initial = user?.fullName?.slice(0, 1).toUpperCase() ?? 'U';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo"><span>E</span> EduFlow</div>
        <button className="organization-switcher" type="button">EduFlow Academy <b>⌄</b></button>
        <nav className="sidebar-nav" aria-label="Điều hướng chính">
          <section className="nav-group"><p>General</p><button className="nav-item" type="button" onClick={() => navigate('/dashboard')}><span>▦</span>Dashboard</button></section>
          <section className="nav-group"><p>People</p><button className="nav-item" type="button"><span>◎</span>Students</button><button className="nav-item" type="button"><span>♙</span>Teachers</button><button className="nav-item" type="button"><span>♧</span>Parents</button></section>
          <section className="nav-group"><p>System</p><button className="nav-item" type="button"><span>⚙</span>Settings</button></section>
        </nav>
        <button className="sidebar-logout" type="button" onClick={handleLogout}>↪ Đăng xuất</button>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar"><button className="mobile-menu" type="button" aria-label="Mở menu">☰</button><div className="topbar-search">⌕ <input placeholder="Tìm kiếm học viên, lớp học..." aria-label="Tìm kiếm" /></div><div className="topbar-actions"><button type="button" aria-label="Thông báo">♧<i></i></button><button className="topbar-avatar profile-trigger" type="button" aria-label="Trang cá nhân">{initial}</button></div></header>
        <div className="dashboard-content profile-content">
          <div className="profile-heading"><button type="button" onClick={() => navigate('/dashboard')}>← Quay lại dashboard</button><h1>Trang cá nhân</h1><p>Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p></div>
          <section className="profile-card"><div className="profile-cover"></div><div className="profile-overview"><span className="profile-avatar">{initial}</span><div><h2>{user?.fullName ?? 'Người dùng'}</h2><p>{user?.email}</p><span className="active-badge">● Tài khoản hoạt động</span></div></div><div className="profile-details"><div><small>Họ và tên</small><strong>{user?.fullName ?? 'Chưa cập nhật'}</strong></div><div><small>Email</small><strong>{user?.email ?? 'Chưa cập nhật'}</strong></div><div><small>Số điện thoại</small><strong>{user?.phone || 'Chưa cập nhật'}</strong></div><div><small>Vai trò</small><strong>Owner</strong></div><div><small>Trạng thái</small><strong className="status-active">● {user?.status === 'ACTIVE' ? 'Đang hoạt động' : user?.status ?? 'Chưa cập nhật'}</strong></div><div><small>Tham gia từ</small><strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</strong></div></div></section>
          <section className="profile-card security-card"><div><h2>Bảo mật tài khoản</h2><p>Đổi mật khẩu hoặc quản lý cách bạn đăng nhập vào EduFlow.</p></div><button type="button">Đổi mật khẩu</button></section>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
