import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/auth/AuthPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import BranchesPage from '../pages/branches/BranchesPage';
import ProfilePage from '../pages/profile/ProfilePage';
import AcademicYearsPage from '../pages/academic-years/AcademicYearsPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import OtpVerifyPage from '../pages/auth/OtpVerifyPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import RegisterOtpVerifyPage from '../pages/auth/RegisterOtpVerifyPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
      <Route path="/verify-otp" element={<PublicOnlyRoute><OtpVerifyPage /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
      <Route path="/register/verify-otp" element={<PublicOnlyRoute><RegisterOtpVerifyPage /></PublicOnlyRoute>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/branches" element={<ProtectedRoute><BranchesPage /></ProtectedRoute>} />
      <Route path="/academic-years" element={<ProtectedRoute><AcademicYearsPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
