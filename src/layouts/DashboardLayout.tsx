import { useState, type ReactNode } from 'react';
import AppSidebar from '../components/AppSidebar/AppSidebar';
import AppHeader from '../components/AppHeader/AppHeader';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  activeLabel: string;
  searchPlaceholder?: string;
  children: ReactNode;
}

function DashboardLayout({
  activeLabel,
  searchPlaceholder,
  children,
}: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <AppSidebar
        activeLabel={activeLabel}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <main className="dashboard-main">
        <AppHeader
          searchPlaceholder={searchPlaceholder}
          onToggleSidebar={() => setIsMobileOpen((prev) => !prev)}
        />
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;

