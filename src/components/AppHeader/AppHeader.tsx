import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';

interface AppHeaderProps {
  searchPlaceholder?: string;
  onToggleSidebar?: () => void;
}

function AppHeader({
  searchPlaceholder = 'Tìm kiếm học viên, lớp học...',
  onToggleSidebar,
}: AppHeaderProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const name = user?.fullName ?? 'Huy Vũ Quang';
  const role = 'Quản trị viên';

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          type="button"
          aria-label="Mở menu"
          onClick={onToggleSidebar}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="topbar-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input placeholder={searchPlaceholder} aria-label="Tìm kiếm" />
        </div>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          aria-label="Thông báo"
          className="topbar-icon-btn"
          title="Thông báo hệ thống"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="notification-badge-count">3</span>
        </button>

        <button
          type="button"
          aria-label="Đổi giao diện"
          className="topbar-icon-btn"
          title="Chế độ giao diện"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>

        <button
          className="topbar-user"
          type="button"
          onClick={() => navigate('/profile')}
          aria-label="Mở trang cá nhân"
        >
          <div className="topbar-avatar-wrapper">
            <span className="topbar-avatar">HV</span>
          </div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{name}</span>
            <span className="topbar-user-role">{role}</span>
          </div>
        </button>
      </div>
    </header>
  );
}

export default AppHeader;


