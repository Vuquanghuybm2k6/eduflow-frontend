import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    user,
    loadUser,
    tryRestoreSession,
    isLoading,
    hasAttemptedRestore,
  } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !hasAttemptedRestore && !isLoading) {
      tryRestoreSession();
    }
  }, [isAuthenticated, hasAttemptedRestore, isLoading, tryRestoreSession]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      loadUser();
    }
  }, [isAuthenticated, user, loadUser]);

  if (isLoading && !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!isAuthenticated && hasAttemptedRestore) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
