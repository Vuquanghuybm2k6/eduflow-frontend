import { useAuthStore } from '../stores/auth.store';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem' }}>
          <span style={{ background: '#4f46e5', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>E</span>
          {' '}EduFlow
        </h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Đăng xuất
        </button>
      </header>

      <main>
        <h2 style={{ marginBottom: '1rem' }}>Chào mừng, {user?.fullName}!</h2>
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
        }}>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Trạng thái:</strong> {user?.status}</p>
          <p><strong>Số điện thoại:</strong> {user?.phone || 'Chưa cập nhật'}</p>
          <p><strong>Ngày tạo:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}</p>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
