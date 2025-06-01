import { CalendarDay, LeaveEvent } from '../types';

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
  // We want weeks to start on Monday (1) and end on Sunday (0)
  let firstDayOfWeek = firstDayOfMonth.getDay();
  if (firstDayOfWeek === 0) firstDayOfWeek = 7; // treat Sunday as 7 for Monday-start
  const prevMonth = new Date(year, month, 0);
  const daysInPrevMonth = prevMonth.getDate();
  
  // Fill days from previous month to start on Monday
  for (let i = firstDayOfWeek - 1; i > 0; i--) {
    days.push(new Date(year, month - 1, daysInPrevMonth - i + 1));
  }
  
  // Get days in current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Fill days from next month to complete the last week (end on Sunday)
  let lastDayOfWeek = lastDayOfMonth.getDay();
  if (lastDayOfWeek === 0) lastDayOfWeek = 7;
  const daysToAdd = 7 - lastDayOfWeek;
  for (let i = 1; i <= daysToAdd && daysToAdd < 7; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

export const getDaysInWeek = (date: Date): Date[] => {
  const days: Date[] = [];
  const currentDate = new Date(date);
  const day = currentDate.getDay();
  const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  
  const monday = new Date(currentDate.setDate(diff));
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push(date);
  }
  
  return days;
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getEventsForDay = (date: Date, events: LeaveEvent[]): LeaveEvent[] => {
  return events.filter(event => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    return date >= startDate && date <= endDate;
  });
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const getCalendarDays = (currentDate: Date, view: 'year' | 'month' | 'week', events: LeaveEvent[]): CalendarDay[] => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  let days: Date[];

  if (view === 'month') {
    days = getDaysInMonth(year, month);
  } else if (view === 'week') {
    days = getDaysInWeek(currentDate);
  } else {
    // fallback for 'year' (should not be used for a single month)
    days = getDaysInMonth(year, month);
  }

  return days.map(date => {
    const isCurrentMonth = date.getMonth() === month;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isToday = isSameDay(date, today);
    const dayEvents = getEventsForDay(date, events);
    const weekNumber = getWeekNumber(date);
    return {
      date,
      isCurrentMonth,
      isWeekend,
      isToday,
      events: dayEvents,
      weekNumber
    };
  });
};

export const doDatesOverlap = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  
  s1.setHours(0, 0, 0, 0);
  e1.setHours(0, 0, 0, 0);
  s2.setHours(0, 0, 0, 0);
  e2.setHours(0, 0, 0, 0);
  
  return s1 <= e2 && s2 <= e1;
};