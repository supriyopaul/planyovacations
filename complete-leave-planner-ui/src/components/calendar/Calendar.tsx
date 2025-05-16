import React from 'react';
import { format, isSameMonth, isToday, parseISO } from 'date-fns';
import { useAppStore } from '../../store/appStore';
import { useCalendarStore } from '../../store/calendarStore';
import { getWeekDays, getMonthName } from '../../utils/calendar';
import { cn } from '../../utils/cn';
import type { Event } from '../../types/domain';

interface CalendarHeaderProps {
  currentDate: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {getMonthName(currentDate)}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreviousMonth}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
          >
            <span className="sr-only">Previous month</span>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={onNextMonth}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
          >
            <span className="sr-only">Next month</span>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
      <button
        onClick={onToday}
        className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
      >
        Today
      </button>
    </div>
  );
}

interface CalendarCellProps {
  date: string;
  isWeekend: boolean;
  isHoliday: boolean;
  isOptionalHoliday: boolean;
  events: Event[];
  isCurrentMonth: boolean;
  onDateClick: (date: string) => void;
}

function CalendarCell({
  date,
  isWeekend,
  isHoliday,
  isOptionalHoliday,
  events,
  isCurrentMonth,
  onDateClick,
}: CalendarCellProps) {
  const parsedDate = parseISO(date);
  const isCurrentDay = isToday(parsedDate);

  return (
    <button
      onClick={() => onDateClick(date)}
      className={cn(
        'relative min-h-[120px] p-2 text-left transition-colors hover:bg-slate-50',
        !isCurrentMonth && 'bg-slate-50 text-slate-400',
        isWeekend && 'bg-slate-50',
        isHoliday && 'bg-holiday-100 text-holiday-700',
        isOptionalHoliday && 'bg-optional-100 text-optional-700',
        isCurrentDay && 'bg-primary-50 font-semibold text-primary-700'
      )}
    >
      <time
        dateTime={date}
        className={cn(
          'sticky top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full text-sm',
          isCurrentDay && 'bg-primary-500 text-white'
        )}
      >
        {format(parsedDate, 'd')}
      </time>
      <div className="mt-1 space-y-1">
        {events.map((event) => (
          <div
            key={event.id}
            className={cn(
              'truncate rounded px-2 py-1 text-xs font-medium',
              event.type === 'leave' && 'bg-primary-100 text-primary-700',
              event.type === 'holiday' && 'bg-holiday-100 text-holiday-700',
              event.type === 'optional-holiday' &&
                'bg-optional-100 text-optional-700',
              event.type === 'busy' && 'bg-busy-100 text-busy-700',
              event.type === 'slow' && 'bg-slow-100 text-slow-700',
              event.type === 'suggested' && 'bg-secondary-100 text-secondary-700'
            )}
          >
            {event.title}
          </div>
        ))}
      </div>
    </button>
  );
}

export function Calendar() {
  const { setSelectedDate, setActiveModal } = useAppStore();
  const { days, settings, setSettings } = useCalendarStore();
  const [currentDate, setCurrentDate] = React.useState(settings.startDate);
  const [view, setView] = React.useState<'month' | 'week'>('month');

  // Ensure days are generated on mount
  React.useEffect(() => {
    if (!days || days.length === 0) {
      setSettings({ startDate: format(new Date(), 'yyyy-MM-dd') });
    }
  }, []);

  const handlePreviousMonth = () => {
    const date = parseISO(currentDate);
    if (view === 'month') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setDate(date.getDate() - 7);
    }
    setCurrentDate(format(date, 'yyyy-MM-dd'));
  };

  const handleNextMonth = () => {
    const date = parseISO(currentDate);
    if (view === 'month') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setDate(date.getDate() + 7);
    }
    setCurrentDate(format(date, 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    setCurrentDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setActiveModal('add-event');
  };

  const weekDays = getWeekDays();

  // Helper to get days for current week
  function getCurrentWeekDays(dateStr: string) {
    const date = parseISO(dateStr);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return days.find((day) => day.date === format(d, 'yyyy-MM-dd')) || {
        date: format(d, 'yyyy-MM-dd'),
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        isHoliday: false,
        isOptionalHoliday: false,
        events: [],
      };
    });
  }

  let visibleDays: typeof days = [];
  if (view === 'month') {
    visibleDays = days.filter((day) =>
      isSameMonth(parseISO(day.date), parseISO(currentDate))
    );
  } else {
    visibleDays = getCurrentWeekDays(currentDate);
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />
      {/* View Toggle */}
      <div className="flex items-center justify-end px-6 py-2 gap-2">
        <button
          className={cn(
            'px-3 py-1 rounded text-sm font-medium',
            view === 'month' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-700'
          )}
          onClick={() => setView('month')}
        >
          Month
        </button>
        <button
          className={cn(
            'px-3 py-1 rounded text-sm font-medium',
            view === 'week' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-700'
          )}
          onClick={() => setView('week')}
        >
          Week
        </button>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200">
          {weekDays.map((day) => (
            <div
              key={day}
              className="border-r border-slate-200 py-2 text-center text-sm font-semibold text-slate-900 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        <div className={cn(
          'grid flex-1',
          view === 'month' ? 'grid-cols-7 grid-rows-6' : 'grid-cols-7 grid-rows-1',
          'border-b border-slate-200'
        )}>
          {visibleDays.map((day) => (
            <CalendarCell
              key={day.date}
              date={day.date}
              isWeekend={day.isWeekend}
              isHoliday={day.isHoliday}
              isOptionalHoliday={day.isOptionalHoliday}
              events={day.events}
              isCurrentMonth={isSameMonth(
                parseISO(day.date),
                parseISO(currentDate)
              )}
              onDateClick={handleDateClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 