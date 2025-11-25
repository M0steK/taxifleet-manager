import React, { useState } from 'react';

function LoginPage({ onLoginSuccess }) {
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

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="m-[min(10vw,70px)] w-full max-w-md rounded-lg bg-slate-800 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">Witaj w TaxiFleet!</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 rounded-md bg-red-900/50 p-3 text-center text-red-400">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-400">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full rounded-md border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-400">
              Hasło
            </label>
            <input
              type="password"
              id="password"
              className="w-full rounded-md border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-sky-600 px-4 py-2 font-semibold text-white transition duration-300 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Zaloguj się
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
