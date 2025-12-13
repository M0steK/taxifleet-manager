export function getShiftWindow(dateStr, shiftType) {
  const base = new Date(dateStr + 'T00:00:00');
  const start = new Date(base);
  const end = new Date(base);
  switch (shiftType) {
    case 'morning':
      start.setHours(6, 0, 0, 0);
      end.setHours(14, 0, 0, 0);
      break;
    case 'afternoon':
      start.setHours(14, 0, 0, 0);
      end.setHours(22, 0, 0, 0);
      break;
    case 'night':
      start.setHours(22, 0, 0, 0);
      end.setDate(end.getDate() + 1);
      end.setHours(6, 0, 0, 0);
      break;
    default:
      throw new Error('Invalid shift type');
  }
  return { start, end };
}

export function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - diffToMonday);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export function getWeekDates(weekStart) {
  const monday = new Date(weekStart);
  monday.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}
