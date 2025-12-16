import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import DriverDashboard from './components/DriverDashboard';
import VehicleManagment from './components/VehicleManagment';
import UserManagement from './components/UserManagment';
import DriverMap from './components/DriverMap';
import DriverShiftSignupPage from './components/DriverShiftSignupPage';
import ScheduleManagement from './components/ScheduleManagement/ScheduleManagement';
import Header from './components/Header';

const featureFlags = {
  enableScheduleManagement: true,
};

const routeMap = {
  dashboard: '/dashboard',
  vehicleManagment: '/vehicles',
  userManagment: '/users',
  scheduleManagement: '/schedule',
  driverMap: '/map',
  driverSignup: '/driver-shifts',
};

function useRehydrateUser() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error('Failed to parse user from storage', err);
      return null;
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved && !user) {
      try {
        setUser(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse user from storage', err);
      }
    }
  }, [user]);

  return [user, setUser];
}

function PrivateLayout({ user, onLogout, navigateTo }) {
  const location = useLocation();
  const currentPage = useMemo(() => {
    const path = location.pathname;
    const entry = Object.entries(routeMap).find(([, value]) => value === path);
    return entry ? entry[0] : 'dashboard';
  }, [location.pathname]);

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen text-white bg-slate-900">
      <Header user={user} onLogout={onLogout} navigateTo={navigateTo} currentPage={currentPage} />
      <div className="pt-4">
        <Outlet />
      </div>
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const [user, setUser] = useRehydrateUser();

  const navigateTo = (pageKey) => {
    const target = routeMap[pageKey] || '/dashboard';
    navigate(target);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const requireRole = (role, element) => {
    if (!user) return <Navigate to="/login" replace />;
    if (Array.isArray(role)) {
      return role.includes(user.role) ? element : <Navigate to="/dashboard" replace />;
    }
    return user.role === role ? element : <Navigate to="/dashboard" replace />;
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <div className="min-h-screen text-white bg-slate-900">
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigateToRegister={() => navigate('/register')}
            />
          </div>
        }
      />
      <Route
        path="/register"
        element={
          <div className="min-h-screen text-white bg-slate-900">
            <RegisterPage onNavigateToLogin={() => navigate('/login')} />
          </div>
        }
      />

      <Route
        element={<PrivateLayout user={user} onLogout={handleLogout} navigateTo={navigateTo} />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            user?.role === 'driver' ? (
              <DriverDashboard user={user} onLogout={handleLogout} navigateTo={navigateTo} />
            ) : (
              <Dashboard
                user={user}
                onLogout={handleLogout}
                navigateTo={navigateTo}
                featureFlags={featureFlags}
              />
            )
          }
        />
        <Route
          path="/vehicles"
          element={requireRole(
            'admin',
            <VehicleManagment user={user} onLogout={handleLogout} navigateTo={navigateTo} />
          )}
        />
        <Route
          path="/users"
          element={requireRole(
            'admin',
            <UserManagement user={user} onLogout={handleLogout} navigateTo={navigateTo} />
          )}
        />
        {featureFlags.enableScheduleManagement && (
          <Route
            path="/schedule"
            element={requireRole(
              'admin',
              <ScheduleManagement user={user} onLogout={handleLogout} navigateTo={navigateTo} />
            )}
          />
        )}
        <Route
          path="/map"
          element={requireRole(
            'driver',
            <DriverMap user={user} onLogout={handleLogout} navigateTo={navigateTo} />
          )}
        />
        <Route
          path="/driver-shifts"
          element={requireRole(
            'driver',
            <DriverShiftSignupPage user={user} onLogout={handleLogout} navigateTo={navigateTo} />
          )}
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
