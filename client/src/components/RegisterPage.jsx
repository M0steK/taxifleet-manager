import React, { useState } from 'react';

function RegisterPage({onNavigateToLogin }) {
  const [mode, setMode] = useState('company');
  const [formData, setFormData] = useState({
    companyName: '',
    joinCode: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const endpoint = mode === 'company' ? '/api/auth/register-company' : '/api/auth/register-driver';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rejestracja nie powiodła się');
      }

      if (mode === 'company') {
        setSuccessMessage(`Firma zarejestrowana! Twój kod dołączenia to: ${data.company.joinCode}. Zaloguj się teraz.`);
      } else {
        setSuccessMessage('Rejestracja udana! Twoje konto oczekuje na akceptację administratora.');
      }
      
      setTimeout(() => {
          onNavigateToLogin();
      }, 5000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-slate-900">
      <div className="m-[min(10vw,70px)] w-full max-w-md rounded-lg bg-slate-800 p-8 shadow-lg">
        <h2 className="mb-6 text-3xl font-bold text-center">Rejestracja</h2>
        
        <div className="flex justify-center mb-6 space-x-4">
          <button
            className={`px-4 py-2 rounded ${mode === 'company' ? 'bg-sky-600' : 'bg-slate-700'}`}
            onClick={() => setMode('company')}
          >
            Nowa Firma
          </button>
          <button
            className={`px-4 py-2 rounded ${mode === 'driver' ? 'bg-sky-600' : 'bg-slate-700'}`}
            onClick={() => setMode('driver')}
          >
            Kierowca
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-center text-red-400 rounded-md bg-red-900/50">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="p-3 mb-4 text-center text-green-400 rounded-md bg-green-900/50">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'company' && (
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-slate-400">Nazwa Firmy</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-white rounded-md border-slate-700 bg-slate-900 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
          )}

          {mode === 'driver' && (
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-slate-400">Kod Dołączenia</label>
              <input
                type="text"
                name="joinCode"
                value={formData.joinCode}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-white rounded-md border-slate-700 bg-slate-900 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-400">Imię</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-white rounded-md border-slate-700 bg-slate-900 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-400">Nazwisko</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-white rounded-md border-slate-700 bg-slate-900 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-slate-400">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-white rounded-md border-slate-700 bg-slate-900 focus:border-sky-500 focus:ring-sky-500"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-slate-400">Hasło</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-white rounded-md border-slate-700 bg-slate-900 focus:border-sky-500 focus:ring-sky-500"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-slate-400">Telefon</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 text-white rounded-md border-slate-700 bg-slate-900 focus:border-sky-500 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white rounded-md bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Zarejestruj się
          </button>
        </form>
        
        <div className="mt-4 text-center">
            <button onClick={onNavigateToLogin} className="text-sm text-sky-400 hover:text-sky-300">
                Masz już konto? Zaloguj się
            </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
