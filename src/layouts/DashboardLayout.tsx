import type { ReactNode } from 'react';
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
  return (
    <div className="dashboard-shell">
      <AppSidebar activeLabel={activeLabel} />
      <main className="dashboard-main">
        <AppHeader searchPlaceholder={searchPlaceholder} />
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
