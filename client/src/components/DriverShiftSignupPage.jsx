import React from 'react';
import Header from './Header';
import DriverShiftSignup from './DriverShiftSignup';

function DriverShiftSignupPage({ user, onLogout, navigateTo }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header user={user} onLogout={onLogout} navigateTo={navigateTo} currentPage="driverSignup" />
      <main className="px-6 py-12 mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold leading-tight tracking-tight text-white">
            Sprawdź lub zapisz się do grafiku
          </h1>
          
        </div>
        <DriverShiftSignup user={user} />
      </main>
    </div>
  );
}

export default DriverShiftSignupPage;
