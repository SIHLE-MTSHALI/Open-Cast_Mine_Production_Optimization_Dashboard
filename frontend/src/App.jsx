import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
const PlannerWorkspace = lazy(() => import('./pages/PlannerWorkspace'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SiteDashboard = lazy(() => import('./pages/SiteDashboard'));
const FleetDashboard = lazy(() => import('./pages/FleetDashboard'));
const DrillBlastDashboard = lazy(() => import('./pages/DrillBlastDashboard'));
const OperationsDashboard = lazy(() => import('./pages/OperationsDashboard'));
const MonitoringDashboard = lazy(() => import('./pages/MonitoringDashboard'));
const SeedDataPage = lazy(() => import('./pages/SeedDataPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
import { SiteProvider } from './context/SiteContext';
import { ToastProvider } from './context/ToastContext';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Auth pages wrapper with redirect if already logged in
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
};

// Login wrapper to handle navigation after login
const LoginWrapper = () => {
  const navigate = useNavigate();

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    navigate('/app/dashboard');
  };

  return <LoginPage onLogin={handleLogin} />;
};

// Register wrapper (reuses LoginPage in register mode)
const RegisterWrapper = () => {
  const navigate = useNavigate();

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    navigate('/app/dashboard');
  };

  return <LoginPage onLogin={handleLogin} defaultMode="register" />;
};

function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <ToastProvider>
          <Suspense
            fallback={
              <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-300">
                Loading...
              </div>
            }
          >
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/login"
              element={
                <AuthRoute>
                  <LoginWrapper />
                </AuthRoute>
              }
            />

            <Route
              path="/register"
              element={
                <AuthRoute>
                  <RegisterWrapper />
                </AuthRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/app/dashboard"
              element={
                <ProtectedRoute>
                  <SiteDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/planner"
              element={
                <ProtectedRoute>
                  <PlannerWorkspace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/fleet"
              element={
                <ProtectedRoute>
                  <FleetDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/drill-blast"
              element={
                <ProtectedRoute>
                  <DrillBlastDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/operations"
              element={
                <ProtectedRoute>
                  <OperationsDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/monitoring"
              element={
                <ProtectedRoute>
                  <MonitoringDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/seed-data"
              element={
                <ProtectedRoute>
                  <SeedDataPage />
                </ProtectedRoute>
              }
            />

            {/* Legacy /app route redirects to dashboard */}
            <Route
              path="/app"
              element={<Navigate to="/app/dashboard" replace />}
            />

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </SiteProvider>
    </BrowserRouter>
  );
}

export default App;
