import React from 'react';
import morningIcon from '../../assets/icons/morningIcon.svg';
import afternoonIcon from '../../assets/icons/afternoonIcon.svg';
import nightIcon from '../../assets/icons/nightIcon.svg';
import rightArrowIcon from '../../assets/icons/rightArrowIcon.svg';

const SHIFT_TYPES = {
  morning: {name: 'dzienna', hours: '6:00 - 14:00', color: 'yellow', range: [6, 14]},
  afternoon: {name: 'popołudniowa', hours: '14:00 - 22:00', color: 'orange', range: [14, 22]},
  night: {name: 'nocna', hours: '22:00 - 6:00', color: 'indigo', range: [22, 6]},
};

function DayShiftsView({ 
    selectedDate, 
    schedules,
    vehicles,
    onShiftClick,
    showBackButton = false,
    onBackClick = null,
}) {

    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const countUnusedVehiclesForShift = (date, shiftKey) => {
        const y = date.getFullYear();
        const m = date.getMonth();
        const d = date.getDate();
        
        let start, end;
        if (shiftKey === 'morning'){
            start = new Date(y, m, d, 6, 0, 0);
            end = new Date(y, m, d, 14, 0 ,0);
        } else if (shiftKey === 'afternoon'){
            start = new Date(y, m, d, 14, 0, 0);
            end = new Date(y, m, d, 22, 0 ,0);
        } else {
            start = new Date(y, m, d, 22, 0, 0);
            end = new Date(y, m, d + 1, 6, 0 ,0);
        }
        // aktywne pojazdy z dokumentami
        const validVehicles = vehicles.filter(v => {
            if (v.status !== 'active') return false;
            const ins = new Date(v.insuranceExpiry);
            const insp = new Date(v.nextInspectionDate);
            return ins >= end && insp >= end;
        });
        const validVehicleIds = new Set(validVehicles.map(v => v.id));
        const usedValid = new Set();
        for (const s of schedules) {
            const sStart = new Date(s.startTime);
            const sEnd = new Date(s.endTime);
            if (shiftKey === 'night'){
                const startHour = sStart.getHours();
                const anchor = startHour >= 0 && startHour < 6
                    ? new Date(sStart.getFullYear(), sStart.getMonth(), sStart.getDate() - 1)
                    : new Date(sStart.getFullYear(), sStart.getMonth(), sStart.getDate());
                const anchorKey = formatDateKey(anchor);
                const dateKey = formatDateKey(date);
                if (anchorKey !== dateKey){
                    continue;
                }
            }
            if (sStart < end && sEnd > start && validVehicleIds.has(s.vehicleId)) {
                usedValid.add(s.vehicleId);
            }
        }
        const usedCount = usedValid.size;
        const totalCount = validVehicles.length;
        return Math.max(totalCount - usedCount, 0);
    };

    const key = formatDateKey(selectedDate);
    const daySchedules = schedules.filter(s => {
        const st = new Date(s.startTime);
        const h = st.getHours();
        const anchor = h >= 0 && h < 6 ?
            new Date(st.getFullYear(), st.getMonth(), st.getDate() - 1) :
            new Date(st.getFullYear(), st.getMonth(), st.getDate());
        return formatDateKey(anchor) === key;
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    const shiftGroups = { morning: [], afternoon: [], night: []};
    daySchedules.forEach((s) => {
        const h = new Date(s.startTime).getHours();
        if (h >= 6 && h < 14) shiftGroups.morning.push(s);
        else if (h >= 14 && h < 22) shiftGroups.afternoon.push(s);
        else shiftGroups.night.push(s);
    });

    return (
        <div className="max-w-4xl pt-4 mx-auto">
            {showBackButton && (
                <div className="flex items-center mb-6">
                    <button
                        onClick={onBackClick}
                        className="p-3 mr-4 rounded-full bg-slate-600/70 hover:bg-slate-600/90"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <h2 className="text-2xl font-bold text-white">
                        {selectedDate.toLocaleDateString('pl-PL',{
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </h2>
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                {['morning', 'afternoon', 'night'].map((shiftKey) => {
                    const shift = SHIFT_TYPES[shiftKey];
                    const count = shiftGroups[shiftKey].length;
                    const unusedVehicles = countUnusedVehiclesForShift(selectedDate, shiftKey);
                    const colorClasses = {
                        yellow: {
                            bg: 'from-yellow-600 to-yellow-500',
                            border: 'border-yellow-500/30',
                            text: 'text-yellow-300',
                            badge: 'bg-orange-500/20 text-yellow-200 border-yellow-500/40',
                        },
                        orange: {
                            bg: 'from-orange-600 to-orange-500',
                            border: 'border-orange-500/30',
                            text: 'text-orange-300',
                            badge: 'bg-orange-500/20 text-orange-200 border-orange-500/40',
                        },
                        indigo:{
                            bg: 'from-indigo-600 to-indigo-500',
                            border: 'border-indigo-500/30',
                            text: 'text-indigo-300',
                            badge: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40',
                        }
                    }[shift.color];

                    return (
                        <button
                            key={shiftKey}
                            onClick={() => onShiftClick(shiftKey)}
                            className={`relative rounded-2xl border-2 p-6 ${colorClasses.border} group bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:bg-slate-800 hover:shadow-2xl`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`rounded-lg bg-gradient-to-br ${colorClasses.bg} p-3`}>
                                    {shiftKey === 'morning' && (
                                        <img src={morningIcon} className="w-6 h-6 text-white" alt="sunrise"/>
                                    )}
                                    {shiftKey === 'afternoon' && (
                                        <img src={afternoonIcon} className="w-6 h-6 text-white" alt="sun"/>
                                    )}
                                    {shiftKey === 'night' && (
                                        <img src={nightIcon} className="w-6 h-6 text-white" alt="moon"/>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {count > 0 && (
                                        <span className={`rounded-full border px-3 py-1 font-bold ${colorClasses.badge}`}>
                                            {count}
                                        </span>
                                    )}
                                    <span className="px-3 py-1 font-bold text-white border rounded-full border-emerald-500/40 bg-emerald-600/40">
                                        {unusedVehicles}
                                    </span>
                                </div>
                            </div>
                            <h3 className="mb-2 text-2xl font-semibold text-white capitalize">{shift.name}</h3>
                            <p className={`text-md font-medium ${colorClasses.text}`}>{shift.hours}</p>
                            <div className="mt-4 text-sm text-slate-400">
                                {(() => {
                                    const last = count % 10;
                                    return count === 0 ? 'Brak przypisanych zmian' : `Przypisanych: ${count} ` + (last === 1 ? 'zmiana' : last < 5 ? 'zmiany' : 'zmian');
                                })()}
                            </div>
                            <div className="absolute bottom-5 right-5">
                                <img src={rightArrowIcon} className="w-4 h-4"/>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default DayShiftsView;
