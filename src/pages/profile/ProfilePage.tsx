import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import DashboardLayout from '../../layouts/DashboardLayout';
import '../dashboard/DashboardPage.css';

function ProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const initial = user?.fullName?.slice(0, 1).toUpperCase() ?? 'U';

  return (
    <DashboardLayout activeLabel="">
      <div className="dashboard-content profile-content">
        <div className="profile-heading"><button type="button" onClick={() => navigate('/dashboard')}>← Quay lại dashboard</button><h1>Trang cá nhân</h1><p>Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p></div>
        <section className="profile-card"><div className="profile-cover"></div><div className="profile-overview"><span className="profile-avatar">{initial}</span><div><h2>{user?.fullName ?? 'Người dùng'}</h2><p>{user?.email}</p><span className="active-badge">● Tài khoản hoạt động</span></div></div><div className="profile-details"><div><small>Họ và tên</small><strong>{user?.fullName ?? 'Chưa cập nhật'}</strong></div><div><small>Email</small><strong>{user?.email ?? 'Chưa cập nhật'}</strong></div><div><small>Số điện thoại</small><strong>{user?.phone || 'Chưa cập nhật'}</strong></div><div><small>Vai trò</small><strong>Owner</strong></div><div><small>Trạng thái</small><strong className="status-active">● {user?.status === 'ACTIVE' ? 'Đang hoạt động' : user?.status ?? 'Chưa cập nhật'}</strong></div><div><small>Tham gia từ</small><strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</strong></div></div></section>
        <section className="profile-card security-card"><div><h2>Bảo mật tài khoản</h2><p>Đổi mật khẩu hoặc quản lý cách bạn đăng nhập vào EduFlow.</p></div><button type="button">Đổi mật khẩu</button></section>
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
