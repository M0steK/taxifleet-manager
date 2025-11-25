import React, { useState, useEffect, useMemo } from 'react';
import CalendarView from './CalendarView.jsx';
import DayShifts from './DayShifts.jsx';
import ShiftDetails from './ShiftDetails.jsx';

function formatDateKey(date) {
    const year = date.getFullYear();
    //JavaScript liczy miesiace od 0 dlatego +1
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
    }

function getMonthMatrix(year, monthIndex) {
    const first = new Date(year, monthIndex, 1);
    const firstDayIndex = (first.getDay() + 6) % 7; //zamiana na europejski system tygodnia poniedzialek = 1
    const start = new Date(first);

    start.setDate(first.getDate() - firstDayIndex); // cofniecie do poniedzialku - potrzebne do rysowania siatki

    const weeks = [];
    let cur = new Date(start); // ustawienie na pierwszy dzien siatki miesiaca

    for (let i = 0; i < 6; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
        week.push(new Date(cur)); // dodaje do danego tygodnia aktualnie ustawiony dzien
        cur.setDate(cur.getDate() + 1); // przechodzi do nastepnego dnia
        }
        weeks.push(week); // dodaje tydzien do tablicy tygodni
    }
    return weeks;
}

export default function ScheduleManagement({navigateBack}) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [schedules, setSchedules] = useState([]);
    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [currentShiftType, setCurrentShiftType] = useState(null);
    const [form, setForm] = useState({ userId: '', vehicleId: '', start: '', end:'', notes: ''});
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [notesView, setNotesView] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    
    useEffect(() => {
        //fetch data from api
        async function fetchAllData() {
        setLoading(true);
        try {
            //use Promise.all to fetch data in the same time
            const [schedulesRes, usersRes, vehiclesRes] = await Promise.all([
            fetch('/api/schedules'),
            fetch('api/users'),
            fetch('api/vehicles'),
            ]);
    
            const vehiclesData = await vehiclesRes.json();
            const schedulesData = await schedulesRes.json();
            const usersData = await usersRes.json();
    
            setSchedules(schedulesData);
            setUsers(usersData);
            setVehicles(vehiclesData);
        } catch (err) {
            console.error('Bład podczas pobierania danych: ', err);
        } finally {
            setLoading(false);
        }
        }
        fetchAllData();
    }, []);
    
    const prevMonth = () => {
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    
    const nextMonth = () => {
        setCurrentMonth((next) => new Date(next.getFullYear(), next.getMonth() + 1, 1));
    };
    
    const monthMatrix = useMemo(() => {
        return getMonthMatrix(currentMonth.getFullYear(), currentMonth.getMonth());
    }, [currentMonth]);
    
    const byDateSchedules = useMemo(() => {
        const map = new Map();
        schedules.forEach((schedule) => {
        const dateKey = new Date(schedule.startTime);
        const h = dateKey.getHours();
    
        // przypisanie do poprzedniego dnia jesli jest po polnocy
        const anchor =
            h >= 0 && h < 6
            ? new Date(dateKey.getFullYear(), dateKey.getMonth(), dateKey.getDate() - 1)
            : dateKey;
    
        const key = formatDateKey(anchor);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(schedule);
        });
        return map;
    }, [schedules]);

    //   ------------------------------- Day shifts

    const SHIFT_TYPES = {
    morning: {name: 'Zmiana dzienna', hours: '6:00 - 14:00', color: 'yellow', range: [6, 14]},
    afternoon: {name: 'Zmiana popołudniowa', hours: '14:00 - 22:00', color: 'orange', range: [14, 22]},
    night: {name: 'Zmiana nocna', hours: '22:00 - 6:00', color: 'indigo', range: [22, 6]},
    }

    // Do liczenia nieuzywanych pojazdow w danej zmianie
    const getShiftWindow = (date, shiftKey) => {
        const y = date.getFullYear();
        const m = date.getMonth();
        const d = date.getDate();
        if (shiftKey === 'morning'){
            return {start: new Date(y, m, d, 6, 0, 0), end: new Date(y, m, d, 14, 0 ,0)};
        }
        else if (shiftKey === 'afternoon'){
            return { start: new Date(y, m, d, 14, 0, 0), end: new Date(y, m, d, 22, 0 ,0)};
        }
        return {start: new Date(y, m ,d, 22, 0 , 0), end: new Date(y, m ,d  + 1, 6, 0 ,0)};
    };

    // liczenie nieuzywanych
    const countUnusedVehiclesForShift = (date, shiftKey) => {
        const {start, end} = getShiftWindow(date, shiftKey);
        const used = new Set();
        for (const s of schedules){
            const sStart = new Date(s.startTime);
            const sEnd = new Date(s.endTime);
            if (shiftKey === 'night'){
                const startHour = sStart.getHours();
                const anchor = 
                startHour >= 0 && startHour < 6 ?
                    new Date(sStart.getFullYear(), sStart.getMonth(), sStart.getDate() - 1)
                : new Date(sStart.getFullYear(), sStart.getMonth(), sStart.getDate());
                
                const anchorKey = formatDateKey(anchor);
                const dateKey = formatDateKey(date);
                if (anchorKey !== dateKey){
                    continue;
                }
            }
            if(sStart < end && sEnd > start){
                const vehicleId = s.vehicleId;
                if (vehicleId){
                    used.add(vehicleId);
                }
            }
        }
            const usedCount = used.size;
            const totalCount = vehicles.length;
            return Math.max(totalCount - usedCount, 0);
        
    }

    // -------------------------------- Shift Details

    function openAddForm(shiftType){
        setEditingSchedule(null);
        setCurrentShiftType(shiftType);
        let start = '06:00', end = '14:00';
        if (shiftType === 'morning'){
            start = '06:00';
            end = '14:00';
        }else if (shiftType === 'afternoon'){
            start = '14:00';
            end = '22:00';
        }else if (shiftType === 'night'){
            start = '22:00';
            end = '06:00';
        }

        setForm({userId: '', vehicleId: '', start, end, notes: ''});
        setIsFormOpen(true);
    }

    function getInitials(user){
        if (!user) return '';
        return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
    }

    const computeFormDateRange = (date, startHHMM, endHHMM, shiftType) => {
        if (!date || !startHHMM || !endHHMM) return { valid: false};
        const y = date.getFullYear();
        const m = date.getMonth();
        const d = date.getDate();
        const [sh, sm] = startHHMM.split(':').map(Number);
        const [eh, em] = endHHMM.split(':').map(Number);

        if(shiftType !== 'night') {
            const startTime = new Date(y, m, d, sh, sm, 0, 0);
            const endTime = new Date(y, m, d, eh, em, 0, 0);
            if(startTime >= endTime) return {valid: false, startTime, endTime, reason: 'order'};
            return {valid: true, startTime, endTime};
        }
        // night shift logic
        const inLate = (h) => h >= 22 && h <=23;
        const inEarly = (h) => h >= 0 && h <=6;

        let startTime = null;
        let endTime = null;
        if(inLate(sh))
            startTime = new Date(y, m, d, sh, sm, 0, 0);
        else if (inEarly(sh)) startTime = new Date(y,m,d +1, sh, sm, 0 ,0);
        if(inLate(eh))
            endTime = new Date(y, m, d, eh, em, 0, 0);
        else if (inEarly(eh)) endTime = new Date(y, m, d + 1, eh, em, 0, 0);

        if( !startTime || !endTime) return {valid: false};

        const startIsLate = inLate(sh);
        const startIsEarly = inEarly(sh);
        const endIsEarly = inEarly(eh);
        // 22-23   -----   00-06
        if(startIsLate && endIsEarly) {
            return {valid: true, startTime, endTime};
        }
        //  00-06 ----- 00-06
        if(startIsEarly && endIsEarly) {
            if(endTime > startTime) return {valid:true, startTime, endTime};
            return {valid: false, startTime, endTime, reason: 'order'};
        }
        // 22 --- 22      00 ---- 22    23 ---23
        return {valid: false, startTime, endTime, reason: 'night-invalid'};
    }

        //sprawdzanie czy kierowca lub pojazd nie sa zajeci w danym czasie
    function validateScheduleConflict(userId, vehicleId, newStartTime, newEndTime, excludeScheduleId = null){
        for(const schedule of schedules){
            if(excludeScheduleId && schedule.id === excludeScheduleId){
                continue;
            }
            const scheduleStart = new Date(schedule.startTime);
            const scheduleEnd = new Date(schedule.endTime);

            //sprawdzanie czy czas sie naklada
            const timesOverlap = newStartTime < scheduleEnd && newEndTime > scheduleStart;

            if(!timesOverlap){
                continue;
            }

            //jesli sie naklada to sprawdzamy czy sa konflikty kierowcy  i pojazdu
            const scheduleUserId = schedule.user?.id || schedule.userId;
            const scheduleVehicleId = schedule.vehicle?.id || schedule.vehicleId;

            //sprawdz konflikt kierowcy
            if (scheduleUserId === userId){
                const driverName = users.find((u) => u.id ===userId);
                const driverFullName = driverName
                ? `${driverName.firstName} ${driverName.lastName}`
                : 'Ten kierowca';
                return{
                    valid: false,
                    message: `${driverFullName} jest już przypisany do tej zmiany`,
                };
            }
            //sprawdz konflikt pojazdu
            if(scheduleVehicleId === vehicleId){
                const vehicleName = vehicles.find((v) => v.id === vehicleId);
                const vehicleFullName = vehicleName
                ? `${vehicleName.brand} ${vehicleName.model} (${vehicleName.licensePlate})`
                : 'Ten pojazd';
                return{
                    valid: false,
                    message: `${vehicleFullName} jest już przypisany do tej zmiany`,
                };
            }
        }
        return {valid: true};
    }

    async function submitForm(e){
        e?.preventDefault?.();
        if (!selectedDate) return;
        if(!form.userId || !form.vehicleId || !form.start || !form.end){
            alert('Wybierz kierowce, pojazd, oraz godziny startu i końca.');
            return;
        }
        const range = computeFormDateRange(selectedDate, form.start, form.end, currentShiftType);
        if(!range.valid){
            alert( 'Godzina rozpoczęcia nie może być późniejsza niż godzina zakończenia.');
            return;
        }

        //sprawdzanie czy pojazd lub kierowca nie sa przypisani juz
        const validation = validateScheduleConflict(
            form.userId,
            form.vehicleId,
            range.startTime,
            range.endTime,
            editingSchedule?.id
        );

        if(!validation.valid){
            alert(validation.message);
            return;
        }

        const payload = {
            userId: form.userId,
            vehicleId: form.vehicleId,
            startTime: range.startTime.toISOString(),
            endTime: range.endTime.toISOString(),
            notes: form.notes === '' ? null : form.notes,
        };
        try{
            const res = await fetch(
                editingSchedule ? `/api/schedules/${editingSchedule.id}` :'/api/schedules',
                {
                    method: editingSchedule ? 'PATCH' : 'POST',
                    headers: { 'Content-Type' : 'application/json'},
                    body: JSON.stringify(payload),
                }
            );
            if(!res.ok) throw new Error('Błąd podczas zapisu zmiany');
            //odwiez dane
            const fresh = await fetch('/api/schedules');
            const data = await fresh.json();
            setSchedules(data || []);
            setIsFormOpen(false);
            setEditingSchedule(null);
        }catch(err){
            console.error(err);
            alert('Nie udało się zapisać zmiany');
        }
    }

    //edycja grafiku
    function openEditForm(schedule) {
        const st = new Date(schedule.startTime);
        const et = new Date(schedule.endTime);
        const hh = (n) => String(n).padStart(2, '0');
        const h = st.getHours();
        let shiftType = 'night';
        if(h >= 6 && h < 14) shiftType = 'morning';
        else if (h >=14 && h < 22)shiftType = 'afternoon';
        setCurrentShiftType(shiftType);
        setEditingSchedule(schedule);
        setForm({
            userId: schedule.user?.id || schedule.userId || '',
            vehicleId: schedule.vehicle?.id || schedule.vehicleId || '',
            start: `${hh(st.getHours())}:${hh(st.getMinutes())}`,
            end: `${hh(et.getHours())}:${hh(et.getMinutes())}`,
            notes: schedule.notes || '',
        });
        setIsFormOpen(true);
    }

    //usuwanie
    function requestDelete(schedule){
        setDeleteTarget(schedule);
    }

    async function deleteSchedule(id){
        try{
            const res = await fetch(`/api/schedules/${id}`, {method: 'DELETE'});
            if(res.status !== 204 && !res.ok) throw new Error('Błąd usuwania');
            const fresh = await fetch('/api/schedules');
            const data = await fresh.json();
            setSchedules(data || []);
            setDeleteTarget(null);
        }catch(err){
            console.error(err);
            alert('Nie udało się usunąć zmiany');
            setDeleteTarget(null);
        }
    }

    function cancelDelete() {
        setDeleteTarget(null);
    }

    return (
        <div className="min-h-screen p-6 bg-slate-900/90">
        {selectedDate ? ( !selectedShift ? (
            <DayShifts
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setSelectedShift={setSelectedShift}
            SHIFT_TYPES={SHIFT_TYPES}
            formatDateKey={formatDateKey}
            byDateSchedules={byDateSchedules}
            countUnusedVehiclesForShift={countUnusedVehiclesForShift}
            />)
            :
            (
                <ShiftDetails
                selectedDate={selectedDate}
                setSelectedShift={setSelectedShift}
                SHIFT_TYPES={SHIFT_TYPES}
                getShiftWindow={getShiftWindow}
                selectedShift={selectedShift}
                schedules={schedules}   
                openAddForm={openAddForm}
                getInitials={getInitials}
                setNotesView={setNotesView}
                setIsFormOpen={setIsFormOpen}
                setEditingSchedule={setEditingSchedule}
                isFormOpen={isFormOpen}
                editingSchedule={editingSchedule}
                computeFormDateRange={computeFormDateRange}
                submitForm={submitForm}
                form={form}
                currentShiftType={currentShiftType}
                users={users}
                vehicles={vehicles}
                setForm={setForm}
                openEditForm={openEditForm}
                requestDelete={requestDelete}
                deleteTarget={deleteTarget}
                deleteSchedule={deleteSchedule}
                cancelDelete={cancelDelete}
                notesView={notesView}
                />
            )
        ) : (
            <CalendarView 
            formatDateKey={formatDateKey} 
            setSelectedDate={setSelectedDate} 
            currentMonth={currentMonth}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            monthMatrix={monthMatrix}
            byDateSchedules={byDateSchedules}
            loading={loading}
            navigateBack={navigateBack}
            countUnusedVehiclesForShift={countUnusedVehiclesForShift}/>
        )}
        </div>
    );
}
