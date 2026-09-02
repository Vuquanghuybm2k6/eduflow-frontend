import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/auth/AuthPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import BranchesPage from '../pages/branches/BranchesPage';
import ProfilePage from '../pages/profile/ProfilePage';
import CoursesPage from '../pages/courses/CoursesPage';
import ClassesPage from '../pages/classes/ClassesPage';
import ClassDetailPage from '../pages/classes/ClassDetailPage';
import TeachersPage from '../pages/teachers/TeachersPage';
import TeacherDetailPage from '../pages/teachers/TeacherDetailPage';
import StudentsPage from '../pages/students/StudentsPage';
import StudentDetailPage from '../pages/students/StudentDetailPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import OtpVerifyPage from '../pages/auth/OtpVerifyPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import RegisterOtpVerifyPage from '../pages/auth/RegisterOtpVerifyPage';
import MembershipSelectionPage from '../pages/auth/MembershipSelectionPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
      <Route path="/select-membership" element={<PublicOnlyRoute><MembershipSelectionPage /></PublicOnlyRoute>} />
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
      <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
      <Route path="/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
      <Route path="/classes/:id" element={<ProtectedRoute><ClassDetailPage /></ProtectedRoute>} />
      <Route path="/teachers" element={<ProtectedRoute><TeachersPage /></ProtectedRoute>} />
      <Route path="/teachers/:id" element={<ProtectedRoute><TeacherDetailPage /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
      <Route path="/students/:id" element={<ProtectedRoute><StudentDetailPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
