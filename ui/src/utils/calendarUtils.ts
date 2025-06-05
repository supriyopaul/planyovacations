import { CalendarDay, LeaveEvent, CalendarExportData } from '../types';
import jsPDF from 'jspdf';

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
  // Normalize the calendar cell date to local midnight
  const normalizedDay = new Date(date);
  normalizedDay.setHours(0, 0, 0, 0);

  return events.filter(event => {
    // Normalize event start and end dates to local midnight
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return normalizedDay >= startDate && normalizedDay <= endDate;
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

/**
 * Exports the given calendar data as a PDF file using jsPDF.
 * @param data CalendarExportData object
 * @param filename Optional filename for the PDF
 */
export const exportCalendarDataToPDF = (data: CalendarExportData, filename = `calendar-export-${new Date().toISOString().split('T')[0]}.pdf`) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Header ---
  let y = 40;
  doc.setFontSize(20);
  doc.text('Calendar Export', pageWidth / 2, y, { align: 'center' });
  y += 24;
  doc.setFontSize(10);
  doc.text(`Exported: ${new Date().toLocaleString()}`, 40, y);
  y += 14;
  doc.text(`Version: ${data.version}`, 40, y);
  y += 14;
  doc.text(`Calendar View: ${data.calendarView}`, 40, y);
  y += 14;
  doc.text(`Date Range: ${data.startDate || '-'} to ${data.endDate || '-'}`, 40, y);
  y += 14;
  doc.text(`Off Days: ${data.offDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}`, 40, y);
  y += 14;
  doc.text(`Leave Balance: Total ${data.leaveBalance.total}, Used ${data.leaveBalance.used}, Planned ${data.leaveBalance.planned}, Remaining ${data.leaveBalance.remaining}`, 40, y);
  y += 24;

  // --- Calendar Grid(s) ---
  // Helper: get months in range
  function parseValidDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  let start = parseValidDate(data.startDate);
  let end = parseValidDate(data.endDate);
  if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
    // fallback: use current month
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth(), 1);
    // Optionally log for debugging
    if (typeof window !== 'undefined' && window.console) {
      window.console.warn('Invalid or missing start/end date for PDF export. Defaulting to current month.');
    }
  }
  function getMonthsInRange(start: Date, end: Date) {
    if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
      // fallback: current month only
      const now = new Date();
      return [new Date(now.getFullYear(), now.getMonth(), 1)];
    }
    const months = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    while (current <= last) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }
  const months = getMonthsInRange(start, end);

  // Defensive: filter out any undefined or invalid months
  const validMonths = (months || []).filter(m => m && typeof m.getMonth === 'function' && !isNaN(m.getTime()));

  // Debug: log months and validMonths
  if (typeof window !== 'undefined' && window.console) {
    window.console.log('PDF Export months:', months);
    window.console.log('PDF Export validMonths:', validMonths);
  }

  // Helper: get days in month (with leading/trailing days for full weeks)
  function getDaysInMonthGrid(year: number, month: number) {
    const days: Date[] = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    let firstDayOfWeek = firstDayOfMonth.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7; // treat Sunday as 7 for Monday-start
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDayOfWeek - 1; i > 0; i--) {
      days.push(new Date(year, month - 1, daysInPrevMonth - i + 1));
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    let lastDayOfWeek = lastDayOfMonth.getDay();
    if (lastDayOfWeek === 0) lastDayOfWeek = 7;
    const daysToAdd = 7 - lastDayOfWeek;
    for (let i = 1; i <= daysToAdd && daysToAdd < 7; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  }

  // Helper: get events for a day
  function getEventsForDay(date: Date, events: LeaveEvent[]) {
    const normalizedDay = new Date(date);
    normalizedDay.setHours(0, 0, 0, 0);
    return events.filter(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      return normalizedDay >= startDate && normalizedDay <= endDate;
    });
  }

  // Color mapping for event types (match UI)
  const eventTypeColors: Record<string, { bg: string; text: string }> = {
    holiday: { bg: '#DBEAFE', text: '#1D4ED8' }, // blue
    optional_holiday: { bg: '#FEF9C3', text: '#B45309' }, // yellow
    planned_leave: { bg: '#CCFBF1', text: '#0F766E' }, // teal
    busy_period: { bg: '#FECACA', text: '#B91C1C' }, // red
    slow_period: { bg: '#FED7AA', text: '#C2410C' }, // orange
    suggested_leave: { bg: '#FEF3C7', text: '#92400E' }, // amber
  };

  // Day-of-week headers
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Layout constants (improved for readability)
  const margin = 60;
  const cellSize = 64; // Increased for more space
  const cellPadding = 8;
  const headerHeight = 32;
  const badgeHeight = 18;
  const badgeSpacing = 4;
  const maxBadges = 3;
  const monthGridWidth = cellSize * 7 + cellPadding * 2;
  const monthGridHeight = cellSize * 6 + headerHeight + cellPadding * 2;
  let gridX = margin;
  let gridY = y;
  let monthsPerRow = Math.floor((pageWidth - margin * 2) / (monthGridWidth + margin));
  if (monthsPerRow < 1) monthsPerRow = 1;

  validMonths.forEach((monthDate, idx) => {
    if (typeof window !== 'undefined' && window.console) {
      window.console.log('PDF Export processing monthDate:', monthDate);
    }
    if (idx > 0 && idx % monthsPerRow === 0) {
      gridX = margin;
      gridY += monthGridHeight + margin;
      if (gridY + monthGridHeight > pageHeight - margin) {
        doc.addPage();
        gridY = margin;
      }
    }
    // Month header
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text(monthDate.toLocaleString('default', { month: 'long', year: 'numeric' }), gridX + monthGridWidth / 2, gridY, { align: 'center' });
    // Day-of-week header
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    dayNames.forEach((day, i) => {
      doc.text(day, gridX + cellPadding + i * cellSize + cellSize / 2, gridY + headerHeight, { align: 'center' });
    });
    // Draw grid
    const days = getDaysInMonthGrid(monthDate.getFullYear(), monthDate.getMonth());
    let dayIdx = 0;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        const day = days[dayIdx];
        if (!day) {
          dayIdx++;
          continue;
        }
        const isCurrentMonth = day.getMonth() === monthDate.getMonth();
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const isOffDay = data.offDays.includes(day.getDay());
        const x = gridX + cellPadding + col * cellSize;
        const yCell = gridY + headerHeight + cellPadding + row * cellSize;
        // Cell background
        if (!isCurrentMonth) {
          doc.setFillColor('#F1F5F9'); // gray-100
        } else if (isWeekend) {
          doc.setFillColor('#F3F4F6'); // slate-100
        } else if (isOffDay) {
          doc.setFillColor('#E0E7EF'); // subtle blue for off days
        } else {
          doc.setFillColor('#FFFFFF');
        }
        doc.rect(x, yCell, cellSize, cellSize, 'F');
        // Cell border
        doc.setDrawColor('#CBD5E1'); // slate-300
        doc.rect(x, yCell, cellSize, cellSize);
        // Day number
        doc.setFontSize(11);
        doc.setFont(undefined, isCurrentMonth ? 'bold' : 'normal');
        doc.setTextColor(isOffDay ? '#94A3B8' : '#334155');
        doc.text(`${day.getDate()}`, x + 8, yCell + 16);
        // Events as badges
        const events = getEventsForDay(day, data.events);
        let badgeY = yCell + 24;
        events.slice(0, maxBadges).forEach(event => {
          const color = eventTypeColors[event.type] || { bg: '#E5E7EB', text: '#334155' };
          doc.setFillColor(color.bg);
          doc.setDrawColor(color.bg);
          doc.roundedRect(x + 6, badgeY, cellSize - 12, badgeHeight, 5, 5, 'F');
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(color.text);
          // Allow more width for event title, ellipsis if too long
          let title = event.title;
          const maxTitleLen = 18;
          if (title.length > maxTitleLen) title = title.slice(0, maxTitleLen - 1) + '…';
          doc.text(title, x + cellSize / 2, badgeY + badgeHeight - 5, { align: 'center' });
          badgeY += badgeHeight + badgeSpacing;
        });
        if (events.length > maxBadges) {
          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');
          doc.setTextColor('#64748B');
          doc.text(`+${events.length - maxBadges} more`, x + cellSize / 2, badgeY + badgeHeight - 8, { align: 'center' });
        }
        dayIdx++;
      }
    }
    gridX += monthGridWidth + margin;
  });

  doc.save(filename);
};