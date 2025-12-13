import React from 'react';
import addIcon from '../../assets/icons/addIcon.svg';
import calendarIcon from '../../assets/icons/calendarIcon.svg';
import rightArrowIcon from '../../assets/icons/rightArrowIcon.svg';
function ShiftDetails
({
    selectedDate, 
    setSelectedShift,
    SHIFT_TYPES,
    getShiftWindow,
    selectedShift,
    schedules,
    openAddForm,
    getInitials,
    setNotesView,
    setIsFormOpen,
    isFormOpen,
    setEditingSchedule,
    editingSchedule,
    computeFormDateRange,
    submitForm,
    form,
    currentShiftType,
    users,
    vehicles,
    setForm,
    openEditForm,
    requestDelete,
    deleteTarget,
    deleteSchedule,
    cancelDelete,
    notesView
}){

    
    return((() => {
        const {start: shiftStart, end: shiftEnd } = getShiftWindow(
            selectedDate,
            selectedShift
        );
        const shiftSchedules = schedules.filter((s) =>{
            const sStart = new Date(s.startTime);
            const sEnd = new Date(s.endTime);
            return sStart < shiftEnd && sEnd > shiftStart;
        }).sort((a, b) => {
            const d = new Date(a.startTime) - new Date(b.startTime);
            if(d !== 0) return d;
            return String(a.id).localeCompare(String(b.id));
        });

        const tableStyle = "px-6 py-4 text-sm font-bold text-left text-white";
        const shift = SHIFT_TYPES[selectedShift];
        const colorClasses = {
              yellow: {
                bg: 'from-yellow-600 to-yellow-500',
                badge: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40',
                button: 'bg-yellow-600 hover:bg-yellow-500',
              },
              orange: {
                bg: 'from-orange-600 to-orange-500',
                badge: 'bg-orange-500/20 text-orange-200 border-orange-500/40',
                button: 'bg-orange-600 hover:bg-orange-500',
              },
              indigo: {
                bg: 'from-indigo-600 to-indigo-500',
                badge: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40',
                button: 'bg-indigo-600 hover:bg-indigo-500',
              },
            }[shift.color];

            return (
                <>
                <div className="items-center mx-auto max-w-7xl">
               <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <button
                            className="items-center p-3 text-center transition-colors rounded-full bg-slate-800 hover:bg-slate-700"
                            onClick={() => setSelectedShift(null)}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path  strokeLinecap="round"  strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold text-white">{shift.name}</h2>
                            <span className={`rounded-full border px-3 py-1 text-sm font-bold ${colorClasses.badge}`}>
                                {shift.hours}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                            {selectedDate.toLocaleDateString('pl-PL', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                        </div>
                    </div>
                    <button
                        className={`flex rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl ${colorClasses.button} items-center gap-2`}
                        onClick={() => openAddForm(selectedShift)}>
                            <img src={addIcon} className="w-5 h-5"/> 
                            <span>Dodaj zmianę</span>
                        </button>
                    </div>

                    {shiftSchedules.length === 0 ? (
                        <div className="p-12 text-center border-2 border-dashed rounded-2xl border-slate-700 bg-slate-800/30">
                            <div className="flex flex-col items-center gap-4">
                                <div className={`rounded-full bg-gradient-to-br p-4 ${colorClasses.bg} opacity-50`}>
                                    <img src={calendarIcon} className="w-8 h-8 text-white" alt="calendar"/>
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-slate-300">
                                        Brak zmian w tym przedziale czasowym
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Dodaj nową zmianę, klikając przycisk powyżej
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                        
                        <div className="block overflow-hidden border shadow-2xl rounded-2xl border-slate-700 bg-slate-800/50">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className={`bg-gradient-to-r ${colorClasses.bg}`}>
                                        <tr>
                                            <th className={tableStyle}>
                                                Godzina rozpoczęcia
                                            </th>
                                            <th className={tableStyle}>
                                                Godzina zakończenia
                                            </th>
                                            <th className={tableStyle}>
                                                Kierowca
                                            </th>
                                            <th className={tableStyle}>
                                                Pojazd
                                            </th>
                                            <th className={tableStyle}>
                                                Notatki
                                            </th>
                                            <th className={tableStyle}>
                                                Akcje
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {shiftSchedules.map((s, index) => {
                                            const start = new Date(s.startTime);
                                            const end = new Date(s.endTime);
                                            return (
                                                <tr
                                                key = {s.id}
                                                className={`transition-colors hover:bg-slate-700/30 ${index % 2 === 0 ? 'bg-slate-800/30' : ''}`}>
                                                    <td className="px-6 py-4 text-sm font-medium text-white whitespace-nowrap">
                                                        {start.toLocaleString('pl-PL',{
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-white whitespace-nowrap">
                                                        {end.toLocaleString('pl-PL', {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${colorClasses.bg} text-sm font-bold text-shite shadow-md`}>
                                                                {getInitials(s.user)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-white">
                                                                    {s.user?.firstName} {s.user?.lastName}
                                                                </div>
                                                                <div className="text-xs text-slate-400">
                                                                    {s.user?.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-white">
                                                            {s.vehicle?.brand} {s.vehicle?.model}
                                                        </div>
                                                        <div className="text-sm text-slate-400">
                                                            {s.vehicle?.licensePlate}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm align-top text-slate-300">
                                                        <div className="max-w-[320px]">
                                                            {s.notes ? (
                                                                (() => {
                                                                    const text = s.notes || '';
                                                                    const long = text.legth > 120 || 
                                                                    (!/\s/.test(text) && text.length > 40);
                                                                    return(
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="flex-1 break-all line-clamp-2 text-slate-300">
                                                                                {text}
                                                                            </span>
                                                                            {long && (
                                                                                <button
                                                                                type="button"
                                                                                className="inline-flex items-center justify-center w-6 h-6 text-indigo-300 border rounded shrink-0 border-slate-600 bg-slate-700 hover:bg-slate-600"
                                                                                onClick={() => setNotesView(s.notes)}>
                                                                                    <img src={rightArrowIcon} className="w-3 h-3 pl-1" alt="view more"/>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()
                                                            ) : (<span className="text-slate-500">-</span>)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                            className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-600"
                                                            onClick={() => openEditForm(s)}
                                                            >
                                                                Edytuj
                                                            </button>
                                                            <button
                                                            className="rounded-lg bg-rose-600/80 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-600"
                                                            onClick={() => requestDelete(s)}
                                                            >
                                                                Usuń
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        </>
                    )}

                   {isFormOpen && selectedDate &&(
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
                        <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => {
                            setIsFormOpen(false);
                            setEditingSchedule(null);
                        }}/>
                        <div className="relative max-h-[90vh] w-max-7xl max-2-2xl animate-zoom-in overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        {editingSchedule ? 'Edytuj zmianę' : 'Dodaj nową zmianę'}

                                    </h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {selectedDate.toLocaleString('pl-PL', {
                                            weekdat: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <button
                                className="p-2 transition-colors rounded-full bg-slate-800 hover:bg-slate-700"
                                onClick={() =>{
                                    setIsFormOpen(false);
                                    setEditingSchedule(null);
                                }}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={submitForm} className="space-y-5">
                                {(() => {
                                    let unavailableDrivers = new Set();
                                    let unavailableVehicles = new Set();
                                    let invalidDocVehicles = new Set();

                                    if(form.start && form.end && selectedDate){
                                        const range = computeFormDateRange(
                                            selectedDate,
                                            form.start,
                                            form.end,
                                            currentShiftType
                                        );
                                        if (range.valid) {
                                            for (const schedule of schedules){
                                                // pomijanie danych edytowanej zmiany
                                                if (editingSchedule && schedule.id === editingSchedule.id){
                                                    continue;
                                                }

                                                const scheduleStart = new Date(schedule.startTime);
                                                const scheduleEnd = new Date(schedule.endTime);

                                                //sprawdzanie kolizji
                                                const timesOverlap = range.startTime < scheduleEnd && range.endTime > scheduleStart;
                                                if(timesOverlap){
                                                    const scheduleUserId = schedule.user?.id || schedule.userId;
                                                    const scheduleVehicleId = schedule.vehicle?.id || schedule.vehicleId;

                                                    if(scheduleUserId) unavailableDrivers.add(scheduleUserId);
                                                    if(scheduleVehicleId) unavailableVehicles.add(scheduleVehicleId);
                                                }
                                            }
                                            // oznaczanie pojazdow z niewaznymi dok
                                            for (const v of vehicles) {
                                                if (v.status !== 'active') {
                                                    invalidDocVehicles.add(v.id);
                                                    continue;
                                                }
                                                const ins = new Date(v.insuranceExpiry);
                                                const insp = new Date(v.nextInspectionDate);
                                                if (ins < range.endTime || insp < range.endTime) {
                                                    invalidDocVehicles.add(v.id);
                                                }
                                            }
                                        }
                                    }
                                    return(
                                        <div className="grid grid-cols-2 gap-5">
                                            <label className="block">
                                                <span className="mb-2 text-sm font-medium text-slate-300">Kierowca</span>
                                                <select
                                                className="w-full px-3 py-3 mt-1 transition-colors border rounded-lg border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-500 focus:ring2 focus:ring-indigo-500/20"
                                                value={form.userId}
                                                onChange={(e) => setForm((f) => ({...f, userId: e.target.value}))}
                                                required>
                                                    <option value="">Wybierz kierowcę</option>
                                                    {users.map((u) => {
                                                        const isUnavailable = unavailableDrivers.has(u.id);
                                                        return (
                                                            <option
                                                            key={u.id}
                                                            value={u.id}
                                                            disabled={isUnavailable}
                                                            style={isUnavailable ? {color:'#94a3b8', fontStyle:'italic'}: {}}
                                                            >
                                                                {u.firstName} {u.lastName} {isUnavailable ? ' (zajęty/a)' : ''}

                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                {form.userId && unavailableDrivers.has(form.userId) && (
                                                    <p className="mt-1 text-xs text-rose-400">
                                                        Ten kierowca jest już zajęty w wybranym czasie
                                                    </p>
                                                )}
                                            </label>

                                            <label className="block">
                                                <span className="mb-2 text-sm font-medium text-slate-300">Pojazd</span>
                                                <select
                                                className="w-full px-3 py-3 mt-1 transition-colors border rounded-lg border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-2 focus-ring-indigo-500/20"
                                                value={form.vehicleId}
                                                onChange={(e) => setForm((f) => ({...f, vehicleId: e.target.value}))}
                                                required>
                                                    <option value="">Wybierz pojazd</option>
                                                    {vehicles.map((v) => {
                                                        const isUnavailable = unavailableVehicles.has(v.id);
                                                        const isInvalidDocs = invalidDocVehicles.has(v.id);
                                                        return(
                                                            <option
                                                            key={v.id}
                                                            value={v.id}
                                                            disabled={isUnavailable || isInvalidDocs}
                                                            style={ (isUnavailable || isInvalidDocs) ? {color: '#94a3b8', fontStyle: 'italic'} : {}}
                                                            >
                                                                {v.brand} {v.model} - {v.licensePlate} {isUnavailable ? ' (zajęty)' : isInvalidDocs ? ' (nieważne dokumenty)' : ''}

                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                {form.vehicleId && unavailableVehicles.has(form.vehicleId) && (
                                                    <p className="mt-1 text-xs text-rose-400">
                                                        Ten pojazd jest już zajęty w wybranym czasie
                                                    </p>
                                                )}
                                                {form.vehicleId && invalidDocVehicles.has(form.vehicleId) && (
                                                    <p className="mt-1 text-xs text-rose-400">
                                                        Dokumenty pojazdu są nieważne dla wybranej zmiany
                                                    </p>
                                                )}
                                            </label>
                                        </div>
                                    );
                                })()}
                                <div className="grid grid-cols-2 gap-5">
                                    <label className="block">
                                        <span className="mb-2 text-sm font-medium text-slate-300">Godzina rozpoczęcia</span>
                                        <div className="flex gap-2">
                                            <select
                                            className="w-1/2 px-3 py-3 transition-colors border rounded-lg border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            value={form.start.split(':')[0]}
                                            onChange={(e) => {
                                                const [_,min] = form.start.split(':');
                                                setForm((f) => ({...f,start: `${e.target.value}:${min || '00'}`}));

                                            }}
                                            required>
                                                {(() => {
                                                    let hours =[];
                                                    if(currentShiftType === 'morning') {
                                                        for(let h = 6; h <= 14; h++) hours.push(h);
                                                    }else if (currentShiftType === 'afternoon'){
                                                        for (let h = 14; h <= 22; h++) hours.push(h);
                                                    }else {
                                                        hours = [22,23,0,1,2,3,4,5,6];
                                                    }
                                                    return hours.map((h) => {
                                                        const v = String(h).padStart(2, '0');
                                                        return (
                                                            <option key={v} value={v}>
                                                                {v}
                                                            </option>
                                                        );
                                                    });
                                                })()}
                                            </select>
                                            <select
                                            className="w-1/2 px-3 py-3 transition-colors border rounded-lg border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            value={form.start.split(':')[1] || '00'}
                                            onChange={(e) => {
                                                const [h,_] = form.start.split(':');
                                                setForm((f) =>({...f, start: `${h || '06'}:${e.target.value}`}));
                                            }}
                                            required>
                                                {(() => {
                                                    const hour = parseInt(form.start.split(':')[0] || '6');
                                                    // minuty do wyboru
                                                    if(currentShiftType === 'morning' && hour === 14) {
                                                        return <option value='00'>00</option>;
                                                    }
                                                    if(currentShiftType === 'afternoon' && hour === 22){
                                                        return <option value='00'>00</option>;
                                                    }
                                                    if(currentShiftType === 'night' && hour === 6){
                                                        return <option value='00'>00</option>;
                                                    }
                                                    return ['00','15','30','45'].map((m) => (
                                                        <option key={m} value={m}>
                                                            {m}
                                                        </option>
                                                    ));
                                                })()}
                                            </select>
                                        </div>
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 text-sm font-medium text-slate-300">Godzina zakończenia</span>
                                        <div className="flex gap-2">
                                            <select
                                            className="w-1/2 px-3 py-3 transition-colors border rounded-lg border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            value={form.end.split(':')[0]}
                                            onChange={(e) => {
                                                const [_,min] = form.end.split(':');
                                                setForm((f) => ({...f,end: `${e.target.value}:${min || '00'}`}));

                                            }}
                                            required>
                                                {(() => {
                                                    let hours =[];
                                                    if(currentShiftType === 'morning') {
                                                        for(let h = 6; h <= 14; h++) hours.push(h);
                                                    }else if (currentShiftType === 'afternoon'){
                                                        for (let h = 14; h <= 22; h++) hours.push(h);
                                                    }else {
                                                        hours = [22,23,0,1,2,3,4,5,6];
                                                    }
                                                    return hours.map((h) => {
                                                        const v = String(h).padStart(2, '0');
                                                        return (
                                                            <option key={v} value={v}>
                                                                {v}
                                                            </option>
                                                        );
                                                    });
                                                })()}
                                            </select>
                                            <select
                                            className="w-1/2 px-3 py-3 transition-colors border rounded-lg border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            value={form.end.split(':')[1] || '00'}
                                            onChange={(e) => {
                                                const [h,_] = form.end.split(':');
                                                setForm((f) =>({...f, end: `${h || '14'}:${e.target.value}`}));
                                            }}
                                            required>
                                                {(() => {
                                                    const hour = parseInt(form.end.split(':')[0] || '6');
                                                    // minuty do wyboru
                                                    if(currentShiftType === 'morning' && hour === 14) {
                                                        return <option value='00'>00</option>;
                                                    }
                                                    if(currentShiftType === 'afternoon' && hour === 22){
                                                        return <option value='00'>00</option>;
                                                    }
                                                    if(currentShiftType === 'night' && hour === 6){
                                                        return <option value='00'>00</option>;
                                                    }
                                                    return ['00','15','30','45'].map((m) => (
                                                        <option key={m} value={m}>
                                                            {m}
                                                        </option>
                                                    ));
                                                })()}
                                            </select>
                                        </div>
                                    </label>
                                </div>
                                {(() => {
                                    if(!form.start || !form.end || !selectedDate) return null;
                                    const range = computeFormDateRange(
                                        selectedDate,
                                        form.start,
                                        form.end,
                                        currentShiftType
                                    );
                                    if(!range.valid){
                                        return(
                                            <p className="text-sm text-rose-400">Godzina rozpoczęcia nie może być późniejsza lub równa godzinie zakończnia</p>
                                        );
                                    }
                                    return null;
                                })()}
                                <label className="block">
                                        <span className="mb-2 text-sm font-medium text-slate-300">Notatki (opcjonalnie)</span>
                                        <textarea className="w-full px-3 py-3 mt-1 transition-colors border rounded-lg border-slate-700 bg-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                        rows={3}
                                        value={form.notes}
                                        onChange={(e) => setForm((f) => ({...f, notes: e.target.value}))}
                                        placeholder="Dodaj uwagi lub dodatkowe informacje..."/>
                                </label>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                    type="button"
                                    className="px-6 py-3 text-sm font-medium transition-colors rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700"
                                    onClick={() => {
                                        setIsFormOpen(false);
                                        setEditingSchedule(null);
                                    }}>Anuluj</button>
                                    <button
                                    type="submit"
                                    className="px-6 py-3 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 hover:shadow-xl disable:cursor-not-allowed disabled:opacity-50"
                                    disabled={(() => {
                                        if (!form.userId || !form.vehicleId || !form.start || !form.end || !selectedDate) return true;
                                        const range = computeFormDateRange(
                                            selectedDate,
                                            form.start,
                                            form.end,
                                            currentShiftType
                                        );
                                        return !range.valid;
                                    })()}>
                                        {editingSchedule ? 'Zapisz zmiany' : 'Dodaj zmianę'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                   )}
                    {deleteTarget && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={cancelDelete}/>
                            <div className="relative w-full max-w-md p-6 border shadow-xl animate-zoom-in rounded-2xl border-slate-700 bg-slate-900">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white">Potwierdzenie usunięcia</h3>
                                    <button
                                    onClick={cancelDelete}
                                    className="p-2 rounded-full bg-slate-800 hover:bg-slate-700">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round"  strokeWidth={2} d="M6 18L18 6M6 6l12 12"  />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm leading-relaxed text-slate-300">Czy na pewno chcesz usunąć tę zmianę?</p>
                                    <div className="p-4 border rounded-lg border-slate-700 bg-slate-800/60">
                                        <div className="text-sm font-medium text-slate-200">
                                            {new Date(deleteTarget.startTime).toLocaleDateString('pl-PL', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                            })}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-400">
                                            {new Date(deleteTarget.startTime).toLocaleTimeString('pl-PL',{
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}{' '} - {' '}
                                            {new Date(deleteTarget.endTime).toLocaleTimeString('pl-PL',{
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                        <div className="flex flex-col gap-1 mt-2 text-sm text-slate-300">
                                            <span>
                                                Kierowca: {deleteTarget.user?.firstName} {deleteTarget.user?.lastName}
                                            </span>
                                            <span>
                                                Pojazd: {deleteTarget.vehicle?.brand} {deleteTarget.vehicle?.model} - {deleteTarget.vehicle?.licensePlate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                    onClick={cancelDelete}
                                    className="px-5 py-2 text-sm font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700">
                                        Anuluj
                                    </button>
                                    <button
                                    onClick={() => deleteSchedule(deleteTarget.id)}
                                    className="px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-lg bg-rose-600 shadow-rose-900/40 hover:bg-rose-500">
                                        Usuń zmianę
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                   {/* --------------------------- notesiiiik ----------- */}
                   {notesView && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setNotesView(null)}/>
                        <div className="relative w-full max-w-3xl p-6 border shadow-2xl animate-zoom-in rounded-2xl border-slate-700 bg-slate-900">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">Pełna Notatka</h3>
                                <button
                                onClick={() => setNotesView(null)}
                                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round"  strokeWidth={2} d="M6 18L18 6M6 6l12 12"  />
                                    </svg>
                                </button>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/60 p-4">
                                <div className="break-words whitespace-pre-wrap text-slate-200">{notesView}</div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                onClick={() => setNotesView(null)}
                                className="px-5 py-2 text-sm font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700">
                                    Zamknij
                                </button>
                            </div>
                        </div>
                    </div>
                   )}
               </div>
            </div>
               </>
            );
    }) ());
}

export default ShiftDetails;