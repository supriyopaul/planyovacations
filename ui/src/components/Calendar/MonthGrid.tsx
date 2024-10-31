import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { CalendarDay } from './CalendarDay';

interface MonthGridProps {
  month: Date;
  days: Array<{
    date: string;
    isWeekend: boolean;
    isPublicHoliday: boolean;
    publicHolidayName: string;
    isPlannedLeave: boolean;
    isRecommended: boolean;
  }>;
}

export function MonthGrid({ month, days }: MonthGridProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const findDayData = (date: Date) => {
    return days.find(d => d.date === format(date, 'yyyy-MM-dd')) || {
      isWeekend: false,
      isPublicHoliday: false,
      publicHolidayName: '',
      isPlannedLeave: false,
      isRecommended: false,
    };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {format(month, 'MMMM yyyy')}
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 text-center">
            {day}
          </div>
        ))}
        {daysInMonth.map(date => {
          const dayData = findDayData(date);
          return (
            <CalendarDay
              key={format(date, 'yyyy-MM-dd')}
              date={date}
              isWeekend={dayData.isWeekend}
              isPublicHoliday={dayData.isPublicHoliday}
              holidayName={dayData.publicHolidayName}
              isToday={format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')}
              isPlannedLeave={dayData.isPlannedLeave}
              isRecommended={dayData.isRecommended}
            />
          );
        })}
      </div>
    </div>
  );
}