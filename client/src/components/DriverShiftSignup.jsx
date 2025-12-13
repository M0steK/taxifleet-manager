import React, { useEffect, useState, useCallback } from 'react';
import morningIcon from '../assets/icons/morningIcon.svg';
import afternoonIcon from '../assets/icons/afternoonIcon.svg';
import nightIcon from '../assets/icons/nightIcon.svg';
import leftArrowIcon from '../assets/icons/leftArrowIcon.svg';
import rightArrowIcon from '../assets/icons/rightArrowIcon.svg';

const cycleOrder = ['none', 'morning', 'afternoon', 'night'];

const SHIFT_CONFIG = {
  morning: {
    name: 'Dzienna',
    hours: '6:00 - 14:00',
    icon: morningIcon,
    bg: 'from-yellow-600 to-yellow-500',
    border: 'border-yellow-500/30',
  },
  afternoon: {
    name: 'Popołudniowa',
    hours: '14:00 - 22:00',
    icon: afternoonIcon,
    bg: 'from-orange-600 to-orange-500',
    border: 'border-orange-500/30',
  },
  night: {
    name: 'Nocna',
    hours: '22:00 - 6:00',
    icon: nightIcon,
    bg: 'from-indigo-600 to-indigo-500',
    border: 'border-indigo-500/30',
  },
};

export default function DriverShiftSignup({ user }) {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selections, setSelections] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);

  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchAvailability = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const monday = getMonday(today);
      monday.setDate(monday.getDate() + weekOffset * 7);
      const weekStart = formatLocalDate(monday);
      const res = await fetch(`/api/driver/${user.id}/week-availability?weekStart=${weekStart}`);
      if (!res.ok) {
        throw new Error('Nie udało się pobrać dostępności zmian');
      }
      const data = await res.json();
      setAvailability(data);
      const init = {};
      data.days.forEach((d) => {
        init[d.date] = d.driverShift ? d.driverShift : 'none';
      });
      setSelections(init);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, weekOffset]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);

  // Auto reset 
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleCycle = (date) => {
    if (!availability) return;
    const dayData = availability.days.find((d) => d.date === date);
    if (!dayData || dayData.driverShift) return;

    const today = new Date();
    today.setHours(0,0,0,0);
    const isPast = new Date(date) < today;
    if (isPast) return;

    const current = selections[date] || 'none';
    const idx = cycleOrder.indexOf(current);
    const next = cycleOrder[(idx + 1) % cycleOrder.length];
    
    setSelections((prev) => ({ ...prev, [date]: next }));
  };

  const selectedAssignments = Object.entries(selections)
    .filter((entry) => entry[1] !== 'none')
    .map(([date, shiftType]) => ({ date, shiftType }));

  const handleAccept = async () => {
    setMessage(null);
    setError(null);
    if (!selectedAssignments.length) return;
    
    const invalidSelections = [];
    selectedAssignments.forEach(({ date, shiftType }) => {
      const dayData = availability.days.find((d) => d.date === date);
      if (dayData && dayData[shiftType] && dayData[shiftType].freeSlots === 0) {
        invalidSelections.push({ date, shiftType });
      }
    });
    
    if (invalidSelections.length > 0) {
      setError('Nie można zapisać się do pełnych zmian. Wybierz inne zmiany lub dni.');
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`/api/driver/${user.id}/week-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: selectedAssignments }),
      });
      if (!res.ok) {
        throw new Error('Nie udało się zapisać do zmian');
      }
      const data = await res.json();
      const successCount = data.created.length;
      setMessage({
        type: 'success',
        text: `Zapisano ${successCount} zmian`,
      });
      await fetchAvailability();
    } catch (e) {
      setError(e.message);
      await fetchAvailability();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-slate-400">Ładowanie dostępności...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-400">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/30 border border-green-500/50 text-green-300' : 'bg-red-900/30 border border-red-500/50 text-red-300'}`}>
          {message.text}
        </div>
      )}
      <div className="flex flex-row items-center justify-between w-full gap-3 mb-4" aria-label="Nawigacja tygodni">
        
          <button
            onClick={handlePrevWeek}
            aria-label="Poprzedni tydzień"
            className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <img src={leftArrowIcon} alt="" className="w-5 h-5 pr-2" />
          </button>
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-lg font-bold text-white">
              {availability?.days?.length > 0 && (() => {
                const first = new Date(availability.days[0].date);
                const last = new Date(availability.days[availability.days.length - 1].date);
                return `${first.toLocaleDateString('pl-PL')} - ${last.toLocaleDateString('pl-PL')}`;
              })()}
            </div>
          </div>
          <button
            onClick={handleNextWeek}
            aria-label="Następny tydzień"
            className="flex items-center justify-center w-10 h-10 text-white rounded-lg bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <img src={rightArrowIcon} alt="" className="w-5 h-5 pl-2" />
          </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-7">
        {availability?.days.map((d) => {
          const selected = selections[d.date] || 'none';
          const locked = !!d.driverShift;
          const shiftConfig = selected !== 'none' ? SHIFT_CONFIG[selected] : null;
          const dayOfWeek = new Date(d.date).toLocaleDateString('pl-PL', { weekday: 'long' });
          const dayNum = new Date(d.date).getDate();

          let occupiedSlots = 0;
          let totalSlots = 0;
          if (selected !== 'none' && d[selected]) {
            totalSlots = d[selected].capacity || 0;
            occupiedSlots = totalSlots - d[selected].freeSlots;
          }

          let displayHours = shiftConfig?.hours;
          if (locked && d.driverShiftData) {
            const startTime = new Date(d.driverShiftData.startTime);
            const endTime = new Date(d.driverShiftData.endTime);
            const startStr = startTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            const endStr = endTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            displayHours = `${startStr} - ${endStr}`;
          }

          const today = new Date();
          today.setHours(0,0,0,0);
          const isPast = new Date(d.date) < today;

          return (
            <button
              key={d.date}
              onClick={() => handleCycle(d.date)}
              disabled={locked || isPast}
              className={`
                relative rounded-2xl p-4 transition-all duration-300 border-2 flex flex-col h-60
                ${(locked || isPast) ? 'cursor-not-allowed opacity-60' : 'hover:scale-105 cursor-pointer'}
                ${selected === 'none' ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : `bg-gradient-to-br ${shiftConfig.bg} ${shiftConfig.border} shadow-lg`}
              `}
            >
              <div className="flex flex-col items-center justify-between h-full gap-2">
                <div className="text-center">
                  <div className={`text-sm font-bold  uppercase text-slate-100`}>{dayOfWeek}</div>
                  <div className="text-2xl font-bold text-white">{dayNum}</div>
                </div>
                
                {selected !== 'none' && shiftConfig && (
                  <>
                    <div className="p-2 rounded-lg bg-white/10">
                      <img src={shiftConfig.icon} className="w-8 h-8" alt={shiftConfig.name} />
                    </div>
                    <div className="text-sm font-medium leading-tight text-center text-white">
                      {shiftConfig.name}
                    </div>
                    <div className="text-sm font-semibold text-center text-white/80">
                      {displayHours}
                    </div>
                    
                    <div className="w-full mt-1">
                      <div className="flex justify-between text-[8px] text-white/70 mb-1">
                        <span>{occupiedSlots}/{totalSlots}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full transition-all duration-300 bg-white/90"
                          style={{ width: `${totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {locked && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleAccept}
          disabled={saving || !selectedAssignments.length}
          className="px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-green-600 shadow-lg rounded-xl disabled:opacity-40 hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed"
        >
          {saving ? 'Zapisywanie...' : 'Zatwierdź zapisy'}
        </button>
      </div>
    </div>
  );
}
