import React, {useState} from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import VehicleManagment from './components/VehicleManagment'
import UserManagement from './components/UserManagment';
import DriverMap from './components/DriverMap';

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
  
  const NavigateFromDashboard = (targetPage) =>{
    navigateTo(targetPage);
  };

  return (
    <div className="min-h-screen text-white bg-slate-900">
      {currentPage === 'login' && (
        <LoginPage onLoginSuccess={handleLoginSuccess}/>
      )}

      {currentPage === 'dashboard' && (
        <Dashboard user={user} onLogout={handleLogout} navigateTo={NavigateFromDashboard}/>
      )}

      {currentPage ==='vehicleManagment' && (
        <VehicleManagment navigateBack={() => navigateTo('dashboard')}/>
      )}
      
      {currentPage === 'userManagment' && (
        <UserManagement navigateBack={() => navigateTo('dashboard')} />
      )}
      {currentPage === 'driverMap' && (
        <DriverMap
        user={user}
        navigateBack={() => navigateTo('dashboard')}
      />
      )}
      
    </div>
    
  );
}

export default App;