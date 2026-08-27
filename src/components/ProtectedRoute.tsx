import { useEffect } from 'react'; // là một react hook cho phép thực hiện đoạn code sau khi component được render
import { Navigate } from 'react-router-dom'; // dùng để chuyển hướng người dùng đến một url khác
import { useAuthStore } from '../stores/auth.store'; // là zustand store để quản lý trạng thái xác thực của người dùng

export function ProtectedRoute({ children }: { children: React.ReactNode }) { // children là các component con được truyền vào ProtectedRoute
  // react.reactNode là thứ mà react có thể render được, bao gồm các component, string, number, boolean, null, undefined, array hoặc fragment
  const { isAuthenticated, user, loadUser, isLoading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      loadUser();
    }
  }, [isAuthenticated, user, loadUser]);

/*
useEffect có dạng
useEffect(
   function,
   dependency array
)
   [isAuthenticated, user, loadUser] là dêpndency array, nếu một trong các giá trị này thay đổi thì function sẽ được gọi lại
*/ 
  if (isLoading && !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
