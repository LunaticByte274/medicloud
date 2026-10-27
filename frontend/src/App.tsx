import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { LandingPage } from './features/landing/LandingPage.js';
import { ArchitecturePage } from './features/architecture/ArchitecturePage.js';
import { Login } from './features/auth/Login.js';
import { Register } from './features/auth/Register.js';
import { DashboardRouter } from './features/dashboard/DashboardRouter.js';
import { DoctorDiscovery } from './features/patients/DoctorDiscovery.js';
import { AppointmentsList } from './features/appointments/AppointmentsList.js';
import { DocumentsPage } from './features/documents/DocumentsPage.js';
import { AvailabilityManager } from './features/doctors/AvailabilityManager.js';
import { UserManagement } from './features/admin/UserManagement.js';
import { NotificationsPage } from './features/notifications/NotificationsPage.js';
import { ProfilePage } from './features/profile/ProfilePage.js';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Authenticating cloud session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing & Educational Architecture Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/architecture" element={<ArchitecturePage />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected App Routes */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Workspace Protected Routes with AppLayout Shell */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardRouter />} />
                <Route path="doctors" element={<DoctorDiscovery />} />
                <Route path="appointments" element={<AppointmentsList />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="workspace/architecture" element={<ArchitecturePage />} />
                <Route
                  path="availability"
                  element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                      <AvailabilityManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/audit"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
