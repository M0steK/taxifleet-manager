import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import DriverDashboard from './components/DriverDashboard';
import VehicleManagment from './components/VehicleManagment';
import UserManagement from './components/UserManagment';
import DriverMap from './components/DriverMap';
import DriverShiftSignupPage from './components/DriverShiftSignupPage';
import ScheduleManagement from './components/ScheduleManagement/ScheduleManagement';
const featureFlags = {
  enableScheduleManagement: true,
};

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const navigateTo = (page) => setCurrentPage(page);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    navigateTo('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    navigateTo('login');
  };

  const NavigateFromDashboard = (targetPage) => {
    navigateTo(targetPage);
  };

  return (
    <div className="min-h-screen text-white bg-slate-900">
      {currentPage === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}

      {currentPage === 'dashboard' && (
        user?.role === 'driver' ? (
          <DriverDashboard
            user={user}
            onLogout={handleLogout}
            navigateTo={NavigateFromDashboard}
          />
        ) : (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            navigateTo={NavigateFromDashboard}
            featureFlags={featureFlags}
          />
        )
      )}

      {currentPage === 'vehicleManagment' && (
        <VehicleManagment user={user} onLogout={handleLogout} navigateTo={navigateTo} />
      )}

      {currentPage === 'userManagment' && (
        <UserManagement user={user} onLogout={handleLogout} navigateTo={navigateTo} />
      )}

      {currentPage === 'scheduleManagement' && featureFlags.enableScheduleManagement && (
        <ScheduleManagement user={user} onLogout={handleLogout} navigateTo={navigateTo} />
      )}


      {currentPage === 'driverMap' && (
        <DriverMap user={user} onLogout={handleLogout} navigateTo={navigateTo} />
      )}
      {currentPage === 'driverSignup' && (
        <DriverShiftSignupPage user={user} onLogout={handleLogout} navigateTo={navigateTo} />
      )}
    </div>
  );
}

export default App;
