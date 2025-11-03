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
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full m-[min(10vw,70px)] max-w-md p-8 rounded-lg shadow-lg bg-slate-800">
        <h2 className="mb-6 text-3xl font-bold text-center text-white">
          Witaj w TaxiFleet!
        </h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 mb-4 text-center text-red-400 rounded-md bg-red-900/50">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-slate-400"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 text-white rounded-md border-slate-700 bg-slate-900 placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-slate-400"
            >
              Hasło
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 text-white rounded-md border-slate-700 bg-slate-900 placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white transition duration-300 rounded-md bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Zaloguj się
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;


