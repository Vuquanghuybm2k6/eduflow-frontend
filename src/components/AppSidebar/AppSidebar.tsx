import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';

const navGroups = [
  { title: 'General', items: [['Dashboard', '▦']] },
  { title: 'People', items: [['Students', '◎'], ['Teachers', '♙'], ['Parents', '♧']] },
  { title: 'Academics', items: [['Classes', '▣'], ['Courses', '◫'], ['Subjects', '◈'], ['Schedule', '◷'], ['Attendance', '✓'], ['Assessments', '⌁']] },
  { title: 'Finance', items: [['Invoices', '▤'], ['Payments', '◇']] },
  { title: 'System', items: [['Settings', '⚙']] },
  { title: 'Organization', items: [['Branches', '⌂']] },
];

const navRoutes: Record<string, string> = {
  Dashboard: '/dashboard',
  Branches: '/branches',
  Courses: '/courses',
};

interface AppSidebarProps {
  activeLabel: string;
}

function AppSidebar({ activeLabel }: AppSidebarProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-logo">
        <span>E</span> EduFlow
      </div>
      <button className="organization-switcher" type="button">
        EduFlow Academy <b>⌄</b>
      </button>
      <nav className="sidebar-nav" aria-label="Điều hướng chính">
        {navGroups.map((group) => (
          <section key={group.title} className="nav-group">
            <p>{group.title}</p>
            {group.items.map(([label, icon]) => (
              <button
                key={label}
                className={label === activeLabel ? 'nav-item active' : 'nav-item'}
                type="button"
                onClick={() => {
                  const route = navRoutes[label];
                  if (route) navigate(route);
                }}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </section>
        ))}
      </nav>
      <button className="sidebar-logout" type="button" onClick={handleLogout}>
        ↪ Đăng xuất
      </button>
    </aside>
  );
}

export default AppSidebar;
