import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Wrench,
} from 'lucide-react';
import Header from './Header';
import DayShiftsView from './shared/DayShiftsView';
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

function AllDriversPickupsChart({ weekly }) {
  const labels = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];
  const counts = labels.map((_, idx) => weekly?.[idx] ?? 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Odebrani klienci (wszyscy kierowcy)',
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
      <h2 className="mb-4 text-lg font-semibold text-white">Odbiory wszystkich kierowców — ostatni tydzień</h2>
      <Bar data={data} options={options} />
    </div>
  );
}

function TopDriversRanking({ topDrivers }) {
  return (
    <div className="h-full p-6 border bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-sm rounded-3xl border-purple-700/30">
      <h2 className="mb-4 text-lg font-semibold text-white">Top 5 kierowców</h2>
      {topDrivers && topDrivers.length > 0 ? (
        <div className="space-y-3">
          {topDrivers.map((driver, index) => (
            <div key={driver.userId} className="flex items-center justify-between p-3 rounded-lg bg-purple-800/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-purple-600 rounded-full">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-white">
                    {driver.firstName} {driver.lastName}
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold text-purple-200">
                {driver.count}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-purple-200">Brak danych</p>
      )}
    </div>
  );
}

function Dashboard({ user, onLogout, navigateTo }) {
  const [stats, setStats] = useState(null);
  const [allSchedules, setAllSchedules] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllMaintenance, setShowAllMaintenance] = useState(false);
  const [weeklyPickups, setWeeklyPickups] = useState(null);
  const [topDrivers, setTopDrivers] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,  
        };
        const [statsResponse, allSchedulesResponse, vehiclesResponse, weeklyResponse, topDriversResponse] = await Promise.all([
          fetch('/api/dashboard/stats', { headers }),
          fetch('/api/schedules', { headers }),
          fetch('/api/vehicles', { headers }),
          fetch('/api/admin/weekly-pickups', { headers }),
          fetch('/api/admin/top-drivers', { headers }),
        ]);

        if (!statsResponse.ok || !allSchedulesResponse.ok || !vehiclesResponse.ok) {
          throw new Error('Błąd podczas pobierania danych');
        }

        const statsData = await statsResponse.json();
        const allSchedulesData = await allSchedulesResponse.json();
        const vehiclesData = await vehiclesResponse.json();

        setStats(statsData);
        setAllSchedules(allSchedulesData);
        setVehicles(vehiclesData);

        if (weeklyResponse.ok) {
          const weeklyData = await weeklyResponse.json();
          setWeeklyPickups(weeklyData.weekly);
        }

        if (topDriversResponse.ok) {
          const topDriversData = await topDriversResponse.json();
          setTopDrivers(topDriversData.topDrivers);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleShiftClick = (shiftType) => {
    const today = new Date();
    sessionStorage.setItem('scheduleNavigation', JSON.stringify({
      date: today.toISOString(),
      shift: shiftType
    }));
    navigateTo('scheduleManagement');
  };

  const getUpcomingMaintenanceWithin7Days = () => {
    if (!stats?.upcomingMaintenance) return [];
    return stats.upcomingMaintenance.filter(vehicle => {
      const maintenanceDate =
        new Date(vehicle.nextInspectionDate) <
        new Date(vehicle.insuranceExpiry)
          ? vehicle.nextInspectionDate
          : vehicle.insuranceExpiry;
      const daysUntil = getDaysUntil(maintenanceDate);
      return daysUntil <= 7;
    });
  };

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
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 border bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-sm rounded-3xl border-blue-700/30">
              <h3 className="mb-2 text-sm font-medium text-blue-200">
                Dostępne samochody
              </h3>
              <p className="text-5xl font-bold text-white">
                {stats?.vehicles.available}/{stats?.vehicles.total}
              </p>
            </div>

            <div className="p-6 border bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-sm rounded-3xl border-blue-700/30">
              <h3 className="mb-2 text-sm font-medium text-blue-200">
                W trasie
              </h3>
              <p className="text-5xl font-bold text-white">
                {stats?.vehicles.onRoad}/{stats?.vehicles.total}
              </p>
            </div>

            <div className="p-6 border bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-sm rounded-3xl border-blue-700/30">
              <h3 className="mb-2 text-sm font-medium text-blue-200">
                Dostępni kierowcy
              </h3>
              <p className="text-5xl font-bold text-white">
                {stats?.drivers.available}/{stats?.drivers.total}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="p-6 border lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-700/50 backdrop-blur-sm rounded-3xl border-slate-600/30">
              <h2 className="flex items-center mb-6 text-xl font-semibold text-white">
                <Calendar className="w-5 h-5 mr-2" />
                Dzisiejszy harmonogram
              </h2>
              <DayShiftsView
                selectedDate={new Date()}
                schedules={allSchedules}
                vehicles={vehicles}
                onShiftClick={handleShiftClick}
                showBackButton={false}
              />
            </div>

            <div className="p-6 border lg:col-span-1 bg-gradient-to-br from-teal-900/50 to-teal-800/30 backdrop-blur-sm rounded-3xl border-teal-700/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center text-lg font-semibold text-white">
                  <Wrench className="w-5 h-5 mr-2" />
                  Przeglądy i ubezpieczenia
                </h2>
                {(() => {
                  const upcomingMaintenance = getUpcomingMaintenanceWithin7Days();
                  return (
                    upcomingMaintenance.length > 2 && (
                      <button
                        onClick={() => setShowAllMaintenance(true)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors text-white text-sm font-medium"
                      >
                        więcej
                      </button>
                    )
                  );
                })()}
              </div>
              {(() => {
                const upcomingMaintenance = getUpcomingMaintenanceWithin7Days();
                const displayedMaintenance = upcomingMaintenance.slice(0, 2);

                if (upcomingMaintenance.length === 0) {
                  return (
                    <p className="text-sm text-teal-200">
                      Brak nadchodzących przeglądów i ubezpieczeń w ciągu 7 dni
                    </p>
                  );
                }

                return (
                  <>
                    <div className="space-y-4">
                      {displayedMaintenance.map((vehicle) => {
                        const inspectionDays = getDaysUntil(vehicle.nextInspectionDate);
                        const insuranceDays = getDaysUntil(vehicle.insuranceExpiry);
                        const showInspection = vehicle.nextInspectionDate && inspectionDays <= 7; 
                        const showInsurance = vehicle.insuranceExpiry && insuranceDays <= 7; 
                        const isOverdue = (vehicle.nextInspectionDate && inspectionDays < 0) || (vehicle.insuranceExpiry && insuranceDays < 0);

                        return (
                          <div
                            key={vehicle.id}
                            className={`relative rounded-xl p-2 border ${isOverdue ? 'bg-red-900/40 border-red-600/40' : 'bg-teal-800/30 border-teal-600/20'}`}
                          >
                            <button
                              onClick={() => {
                                sessionStorage.setItem('vehicleEditId', String(vehicle.id));
                                navigateTo('vehicleManagment');
                              }}
                              className="absolute px-2 py-1 text-xs text-white transition-colors rounded-md top-2 right-2 bg-slate-700 hover:bg-slate-600"
                            >
                              Edytuj
                            </button>
                            <div className="text-white font-medium mb-0.5 text-sm">
                              {vehicle.brand} {vehicle.model}
                            </div>
                            <div className="mb-1 text-xs text-teal-200">
                              ({vehicle.licensePlate})
                            </div>
                            <div className="space-y-1">
                              {showInspection && (
                                <div>
                                <div className="text-xs text-teal-300">Przegląd:</div>
                                  <div className="text-sm font-bold text-yellow-400">
                                  {formatDate(vehicle.nextInspectionDate)}
                                </div>
                                
                              </div>
                              )}
                              {showInsurance && (
                                <div>
                                <div className="text-xs text-teal-300">Ubezpieczenie:</div>
                                  <div className="text-sm font-bold text-yellow-400">
                                  {formatDate(vehicle.insuranceExpiry)}
                                </div>
                                
                              </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AllDriversPickupsChart weekly={weeklyPickups} />
            </div>
            <div className="lg:col-span-1">
              <TopDriversRanking topDrivers={topDrivers} />
            </div>
          </div>
        </div>
      </main>

      {showAllMaintenance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-slate-600 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center text-2xl font-bold text-white">
                <Wrench className="w-6 h-6 mr-2" />
                Wszystkie przeglądy i ubezpieczenia (7 dni)
              </h2>
              <button
                onClick={() => setShowAllMaintenance(false)}
                className="transition-colors text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {getUpcomingMaintenanceWithin7Days().map((vehicle) => {
                const inspectionDays = getDaysUntil(vehicle.nextInspectionDate);
                const insuranceDays = getDaysUntil(vehicle.insuranceExpiry);
                const showInspection = vehicle.nextInspectionDate && inspectionDays <= 7; 
                const showInsurance = vehicle.insuranceExpiry && insuranceDays <= 7; 
                const isOverdue = (vehicle.nextInspectionDate && inspectionDays < 0) || (vehicle.insuranceExpiry && insuranceDays < 0);

                return (
                  <div
                    key={vehicle.id}
                    className={`relative rounded-xl p-2 border ${isOverdue ? 'bg-red-900/40 border-red-600/40' : 'bg-teal-800/30 border-teal-600/20'}`}
                  >
                    <button
                      onClick={() => {
                        sessionStorage.setItem('vehicleEditId', String(vehicle.id));
                        navigateTo('vehicleManagment');
                      }}
                      className="absolute px-2 py-1 text-xs text-white transition-colors rounded-md top-2 right-2 bg-slate-700 hover:bg-slate-600"
                    >
                      Edytuj
                    </button>
                    <div className="text-white font-medium mb-0.5 text-sm">
                      {vehicle.brand} {vehicle.model}
                    </div>
                    <div className="mb-1 text-xs text-teal-200">
                      ({vehicle.licensePlate})
                    </div>
                    <div className="space-y-1">
                      {showInspection && (
                        <div>
                          <div className="text-xs text-teal-300">Przegląd:</div>
                          <div className="text-sm font-bold text-yellow-400">
                            {formatDate(vehicle.nextInspectionDate)}
                          </div>
                        </div>
                      )}
                      {showInsurance && (
                        <div>
                          <div className="text-xs text-teal-300">Ubezpieczenie:</div>
                          <div className="text-sm font-bold text-yellow-400">
                            {formatDate(vehicle.insuranceExpiry)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
