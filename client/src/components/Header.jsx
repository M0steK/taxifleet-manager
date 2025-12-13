import React, { useState } from 'react';
import { Car, ChevronDown } from 'lucide-react';

function Header({ user, onLogout, navigateTo, currentPage }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const roleNames = {
    admin: 'Administrator',
    driver: 'Kierowca',
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <div className="px-6 py-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-2xl">
              <Car className="w-7 h-7 text-slate-900" />
            </div>
            <nav className="flex space-x-6">
              <button
                onClick={() => navigateTo('dashboard')}
                className={`font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => navigateTo('scheduleManagement')}
                    className={`transition-colors ${
                      currentPage === 'scheduleManagement'
                        ? 'text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Harmonogram
                  </button>
                  <button
                    onClick={() => navigateTo('vehicleManagment')}
                    className={`transition-colors ${
                      currentPage === 'vehicleManagment'
                        ? 'text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Zarządzanie Flotą
                  </button>
                  <button
                    onClick={() => navigateTo('userManagment')}
                    className={`transition-colors ${
                      currentPage === 'userManagment'
                        ? 'text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Zarządzanie Kierowcami
                  </button>
                </>
              )}
              {user?.role === 'driver' && (
                <>
                  <button
                    onClick={() => navigateTo('driverMap')}
                    className={`transition-colors ${
                      currentPage === 'driverMap'
                        ? 'text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Mapa
                  </button>
                  <button
                    onClick={() => navigateTo('driverSignup')}
                    className={`transition-colors ${
                      currentPage === 'driverSignup'
                        ? 'text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Grafik
                  </button>
                </>
              )}
            </nav>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center px-4 py-2 space-x-2 transition-colors rounded-full bg-slate-700/50 hover:bg-slate-700"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                <span className="text-sm font-semibold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                {user?.firstName}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-300 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 w-56 mt-2 overflow-hidden border rounded-lg shadow-xl bg-slate-800 border-slate-700">
                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-sm text-slate-400">Zalogowany jako</p>
                  <p className="font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {roleNames[user?.role] || user?.role}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-3 text-left text-red-400 transition-colors hover:bg-slate-700/50"
                >
                  Wyloguj się
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
