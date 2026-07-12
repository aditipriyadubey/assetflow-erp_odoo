import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/common/AppLayout';
import ActivityPage from '../pages/ActivityPage';
import AllocationsPage from '../pages/AllocationsPage';
import AssetsPage from '../pages/AssetsPage';
import AuditsPage from '../pages/AuditsPage';
import BookingsPage from '../pages/BookingsPage';
import DashboardPage from '../pages/DashboardPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import LoginPage from '../pages/LoginPage';
import MaintenancePage from '../pages/MaintenancePage';
import NotFoundPage from '../pages/NotFoundPage';
import OrganizationSetupPage from '../pages/OrganizationSetupPage';
import ReportsPage from '../pages/ReportsPage';
import SignupPage from '../pages/SignupPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import useAuth from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/organization" element={<OrganizationSetupPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/allocations" element={<AllocationsPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/audits" element={<AuditsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<ActivityPage />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
