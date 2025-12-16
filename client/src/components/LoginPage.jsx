import React, { useState } from 'react';

function LoginPage({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Logowanie nie powiodło się');
      }

      const {token, user} = data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="m-[min(10vw,70px)] w-full max-w-md rounded-lg bg-slate-800 p-8 shadow-lg">
        <h2 className="mb-6 text-3xl font-bold text-center text-white">Witaj w TaxiFleet!</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 mb-4 text-center text-red-400 rounded-md bg-red-900/50">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-slate-400">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 text-white rounded-md border-slate-700 bg-slate-900 placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-400">
              Hasło
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 text-white rounded-md border-slate-700 bg-slate-900 placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white rounded-md bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Zaloguj się
          </button>
        </form>
        <div className="mt-4 text-center">
            <button onClick={onNavigateToRegister} className="text-sm text-sky-400 hover:text-sky-300">
                Nie masz konta? Zarejestruj się
            </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
