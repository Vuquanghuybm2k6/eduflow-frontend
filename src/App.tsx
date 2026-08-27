import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// BrowserRouter là component của react-router-dom để quản lý routing trong ứng dụng React, từ đó 
// React router sẽ theo dõi URL của trình duyệt và hiển thị các component tương ứng dựa trên các route được định nghĩa trong ứng dụng.
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
