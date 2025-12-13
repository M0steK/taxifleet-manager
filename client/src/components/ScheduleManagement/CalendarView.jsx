import React from 'react';



export default function CalendarView({
    currentMonth,
    prevMonth,
    nextMonth,
    monthMatrix,
    byDateSchedules,
    formatDateKey,
    setSelectedDate,
    loading,
    countUnusedVehiclesForShift,
}) {


return (
    <div className="p-6">
        <div className="flex items-center justify-center">
            <button
            onClick={prevMonth}
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
            <div className="w-1/6 text-center">
            <div className="text-lg font-bold">
                {currentMonth.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
            </div>
            </div>
            <button
            onClick={nextMonth}
            className="p-3 ml-4 rounded-full bg-slate-600/70 hover:bg-slate-600/90"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            </button>
        </div>

        {loading ? (
            <div className="text-xl font-bold"> Ładowanie... </div>
        ) : (
            <div className="flex items-center justify-center text-center">
            <div className="grid grid-cols-7 gap-2 mt-6">
                {['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'].map(
                (dayName) => (
                    <div
                    key={dayName}
                    className={`w-48 py-2 text-center text-sm font-semibold ${dayName === 'Sobota' || dayName === 'Niedziela' ? 'text-red-500/90' : 'text-slate-400 '}`}
                    >
                    {dayName}
                    </div>
                )
                )}

                {monthMatrix.map((week, weekIndex) => (
                <React.Fragment key={weekIndex}>
                    {week.map((dateObj) => {
                    const isSameMonth = dateObj.getMonth() === currentMonth.getMonth();
                    const dateKey = formatDateKey(dateObj);

                    const daySchedules = byDateSchedules.get(dateKey) || [];
                    const scheduleCount = daySchedules.length;

                    const shiftCounts = {morning: 0, afternoon: 0, night: 0};
                    daySchedules.forEach((s) => {
                        const h = new Date(s.startTime).getHours();
                        if(h >= 6 && h < 14) shiftCounts.morning += 1;
                        else if(h >= 14 && h <22) shiftCounts.afternoon += 1;
                        else shiftCounts.night += 1;
                    });

                    const unusedMorning = countUnusedVehiclesForShift(dateObj, 'morning');
                    const unusedAfternoon = countUnusedVehiclesForShift(dateObj, 'afternoon');
                    const unusedNight = countUnusedVehiclesForShift(dateObj, 'night');
                    const totalUnusedVehicles = unusedMorning + unusedAfternoon + unusedNight;
                    return (
                        <button
                        onClick={() => setSelectedDate(new Date(dateObj))}
                        key={dateKey}
                        className={`m-1 flex h-44 flex-col items-start justify-between rounded-3xl border p-2 transition-all hover:scale-105 ${
                            isSameMonth
                            ? `border-slate-700 bg-gradient-to-br from-slate-900/70 to-slate-700/70 text-white hover:bg-slate-700 ${dateObj.getDate() === new Date().getDate() && dateObj.getMonth() === new Date().getMonth() ? 'ring-2 ring-green-500/60' : ''}`
                            : 'border-slate-800 bg-slate-900/50 text-slate-600'
                        }`}
                        disabled={!isSameMonth}
                        >
                        {/* numerki na button */}
                        <div className="flex items-center justify-between w-full">
                            <span className="pt-1 pl-2 text-2xl font-bold">{dateObj.getDate()}</span>
                            <div className="flex items-center justify-end w-full pt-0.5 pr-2">

                            <span
                            className={`${isSameMonth ? 'text-center mr-2 mt-1 items-center rounded-lg bg-gradient-to-br border border-indigo-500/50 from-indigo-700/50 to-indigo-500/50 w-1/4 py-1 text-sm font-semibold' : ''}`}
                            >
                            {isSameMonth ? scheduleCount : ''}
                            </span>
                            <span
                            className={`${isSameMonth ? 'text-centermr-2 mt-1 items-center rounded-lg border border-emerald-500/50 bg-gradient-to-br from-emerald-600/30 to-emerald-500/30  w-1/4 py-1 text-sm font-semibold' : ''}`}
                            >
                            {isSameMonth ? totalUnusedVehicles : ''}
                            </span>
                            </div>
                        </div>
                        
                        <div className="mt-2 flex flex-col gap-1.5 w-full px-3 mb-4">
                                <div className={`flex items-center gap-2 px-2 py-1 border rounded-md border-yellow-500/20 bg-yellow-500/10 ${shiftCounts.morning === 0  || !isSameMonth ? 'invisible' : ''}`}>
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-sm shadow-yellow-400/50"/>
                                    <span className="text-xs font-medium text-yellow-300">
                                        {shiftCounts.morning} dzienna
                                    </span>
                                </div>
                                <div className={`flex items-center gap-2 px-2 py-1 border rounded-md border-orange-500/20 bg-orange-500/10 ${shiftCounts.afternoon === 0 || !isSameMonth ? 'invisible' : ''}`}>
                                    <div className="w-2 h-2 bg-orange-400 rounded-full shadow-sm shadow-orange-400/50"/>
                                        <span className="text-xs font-medium text-orange-300">
                                            {shiftCounts.afternoon} popołudniowa
                                        </span>
                                </div>
                                <div className={`flex items-center gap-2 px-2 py-1 border rounded-md border-indigo-500/20 bg-indigo-500/10 ${shiftCounts.night === 0 || !isSameMonth ? 'invisible' : ''}`}>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-sm shadow-indigo-400/50"/>
                                        <span className="text-xs font-medium text-indigo-300">
                                            {shiftCounts.night} nocna
                                        </span>
                                    </div>
                        </div>
                        </button>
                    );
                    })}
                </React.Fragment>
                ))}
            </div>
            </div>
        )}
        </div>
    );
}
