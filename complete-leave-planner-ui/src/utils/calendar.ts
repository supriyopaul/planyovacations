import { addDays, addMonths, format, isWeekend, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import type { CalendarDay, CalendarSettings } from '../types/domain';

export function generateCalendarDays(settings: CalendarSettings): CalendarDay[] {
  const startDate = parseISO(settings.startDate);
  const endDate = addMonths(startDate, 12);
  const days: CalendarDay[] = [];

  let currentDate = startDate;
  while (currentDate <= endDate) {
    days.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      isWeekend: isWeekend(currentDate),
      isHoliday: false, // This will be populated by the holiday service
      isOptionalHoliday: false, // This will be populated by the holiday service
      events: [],
    });
    currentDate = addDays(currentDate, 1);
  }

  return days;
}

export function getMonthDays(date: string): CalendarDay[] {
  const start = startOfMonth(parseISO(date));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });

  return days.map((day) => ({
    date: format(day, 'yyyy-MM-dd'),
    isWeekend: isWeekend(day),
    isHoliday: false,
    isOptionalHoliday: false,
    events: [],
  }));
}

export function calculateLeaveDays(startDate: string, endDate: string, settings: CalendarSettings): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  let days = 0;

  let currentDate = start;
  while (currentDate <= end) {
    if (!isWeekend(currentDate) && !settings.leaveBalance.used) {
      days++;
    }
    currentDate = addDays(currentDate, 1);
  }

  return days;
}

export function formatDate(date: string, formatStr: string = 'MMM d, yyyy'): string {
  return format(parseISO(date), formatStr);
}

export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  const d = parseISO(date);
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return d >= start && d <= end;
}

export function getEventDuration(event: { startDate: string; endDate: string }): number {
  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function getMonthName(date: string): string {
  return format(parseISO(date), 'MMMM yyyy');
}

export function getWeekDays(): string[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

export function getWorkDays(): string[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
} 