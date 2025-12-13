import React, { useEffect, useState } from 'react';
import Header from './Header';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-300">{label}</span>
      <span className="font-medium text-white">{value ?? '-'}</span>
    </div>
  );
}

function ShiftCard({ title, shift }) {
  const formatDateTime = (dt) => {
    if (!dt) return '-';
    const date = new Date(dt);
    const dayName = date.toLocaleDateString('pl-PL', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('pl-PL', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return { dayName, dateStr, timeStr };
  };

  const isCurrentShift = title.includes('Aktualna');
  const startTime = shift?.startTime ? formatDateTime(shift.startTime) : null;
  const endTime = shift?.endTime ? formatDateTime(shift.endTime) : null;

  return (
    <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl ${
      isCurrentShift 
        ? 'border-green-500/30 bg-gradient-to-br from-green-900/40 to-green-800/20 hover:border-green-500/50' 
        : 'border-blue-500/30 bg-gradient-to-br from-blue-900/40 to-blue-800/20 hover:border-blue-500/50'
    }`}>
      <div className="absolute w-32 h-32 rounded-full -right-8 -top-8 bg-white/5"></div>
      
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`rounded-xl p-3 ${
            isCurrentShift 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {isCurrentShift ? (
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        
        {shift ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/20">
              <div className="flex items-center gap-2 mb-3 text-xs font-medium tracking-wide uppercase text-slate-400">
                Początek zmiany
              </div>
              <div className="text-2xl font-bold text-white">{startTime?.timeStr || '-'}</div>
              <div className="mt-1 text-sm text-slate-400">
                <span className="font-medium capitalize">{startTime?.dayName || '-'}</span>
                {startTime?.dayName && ', '}
                {startTime?.dateStr || '-'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/20">
              <div className="flex items-center gap-2 mb-3 text-xs font-medium tracking-wide uppercase text-slate-400">
                Koniec zmiany
              </div>
              <div className="text-2xl font-bold text-white">{endTime?.timeStr || '-'}</div>
              <div className="mt-1 text-sm text-slate-400">
                <span className="font-medium capitalize">{endTime?.dayName || '-'}</span>
                {endTime?.dayName && ', '}
                {endTime?.dateStr || '-'}
              </div>
            </div>

            {shift.vehicle && (
              <div className="p-4 border rounded-xl border-white/10 bg-white/5">
                <div className="flex items-center gap-2 mb-2 text-xs font-medium tracking-wide uppercase text-slate-400">
                  Przypisany pojazd
                </div>
                <div className="text-lg font-semibold text-white">
                  {shift.vehicle.brand} {shift.vehicle.model}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 mt-1 font-mono text-sm text-green-400 rounded-md bg-black/30">
                  {shift.vehicle.licensePlate}
                </div>
              </div>
            )}

            {shift.notes && (
              <div className="p-4 border rounded-xl bg-yellow-500/10 border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2 text-xs font-medium tracking-wide text-yellow-400 uppercase">
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Notatki
                </div>
                <div className="text-sm text-yellow-100">{shift.notes}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 mb-4 rounded-full bg-white/5">
              <svg className="w-12 h-12 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-base font-medium text-slate-400">Brak zaplanowanej zmiany</p>
            <p className="mt-1 text-sm text-slate-500">Zapisz się do grafiku</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WeeklyPickupsChart({ weekly }) {
  const labels = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];
  const counts = labels.map((_, idx) => weekly?.[idx] ?? 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Odebrani klienci (ostatni tydzień)',
        data: counts,
        backgroundColor: 'rgba(56, 189, 248, 0.6)',
        borderColor: 'rgba(56, 189, 248, 0.9)',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Odebrani: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#cbd5e1' },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.2)' },
        ticks: { color: '#cbd5e1', stepSize: 1 },
      },
    },
  };

  return (
    <div className="p-6 border bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 backdrop-blur-sm rounded-3xl border-cyan-700/30">
      <h2 className="mb-4 text-lg font-semibold text-white">Odebrani klienci — ostatni tydzień</h2>
      <Bar data={data} options={options} />
    </div>
  );
}

function PickupsSummary({ summary }) {
  return (
    <div className="p-6 border bg-gradient-to-br from-teal-900/50 to-teal-800/30 backdrop-blur-sm rounded-3xl border-teal-700/30">
      <h2 className="mb-4 text-lg font-semibold text-white">Podsumowanie odbiorów (bieżąca zmiana)</h2>
      <div className="space-y-3">
        <InfoRow label="Odebrani klienci" value={summary?.count ?? 0} />
        <InfoRow
          label="Średni czas między odbiorami"
          value={summary?.avgMinutesBetweenPickups != null ? `${summary.avgMinutesBetweenPickups} min` : '—'}
        />
      </div>
    </div>
  );
}

function DriverDashboard({ user, onLogout, navigateTo }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklyPickups, setWeeklyPickups] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) throw new Error('Brak identyfikatora użytkownika');
        const res = await fetch(`/api/driver/${user.id}/dashboard`);
        if (!res.ok) throw new Error('Błąd pobierania danych dashboardu kierowcy');
        const json = await res.json();
        setData(json);

        const statsRes = await fetch(`/api/driver/${user.id}/weekly-pickups?range=last-week`);
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setWeeklyPickups(statsJson.weekly ?? null);
        } else {
          setWeeklyPickups(null);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-xl text-white">Ładowanie...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-xl text-red-400">Błąd: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header user={user} onLogout={onLogout} navigateTo={navigateTo} currentPage="dashboard" />
      <main className="px-6 py-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
          <ShiftCard title="Aktualna zmiana" shift={data?.currentShift} />
          <ShiftCard title="Następna zmiana" shift={data?.nextShift} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WeeklyPickupsChart weekly={weeklyPickups} />
          </div>
          <div className="lg:col-span-1">
            <PickupsSummary summary={data?.pickupsSummary} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default DriverDashboard;
