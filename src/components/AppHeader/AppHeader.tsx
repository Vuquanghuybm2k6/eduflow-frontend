import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';

interface AppHeaderProps {
  searchPlaceholder?: string;
}

function AppHeader({
  searchPlaceholder = 'Tìm kiếm học viên, lớp học...',
}: AppHeaderProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const name = user?.fullName ?? 'Người dùng';
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  return (
    <header className="dashboard-topbar">
      <button className="mobile-menu" type="button" aria-label="Mở menu">
        ☰
      </button>
      <div className="topbar-search">
        ⌕ <input placeholder={searchPlaceholder} aria-label="Tìm kiếm" />
      </div>
      <div className="topbar-actions">
        <button type="button" aria-label="Thông báo" className="topbar-bell">
          🔔<i></i>
        </button>
        <button
          className="topbar-user"
          type="button"
          onClick={() => navigate('/profile')}
          aria-label="Mở trang cá nhân"
        >
          <span className="topbar-avatar">{initials}</span>
          <span className="topbar-user-name">{name}</span>
          <b>▾</b>
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
