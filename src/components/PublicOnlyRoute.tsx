import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    tryRestoreSession,
    isLoading,
    hasAttemptedRestore,
  } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !hasAttemptedRestore && !isLoading) {
      tryRestoreSession();
    }
  }, [isAuthenticated, hasAttemptedRestore, isLoading, tryRestoreSession]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading || !hasAttemptedRestore) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  return <>{children}</>;
}