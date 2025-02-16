import React from 'react';
import type { CalendarDay } from '../types';
import Legend from './Legend';

interface CalendarProps {
  days: CalendarDay[];
}

const Calendar: React.FC<CalendarProps> = ({ days }) => {
  const months = Array.from(
    new Set(days.map(day => new Date(day.date).toLocaleString('default', { month: 'long', year: 'numeric' })))
  );

  const getMonthDays = (month: string) => {
    return days.filter(day => 
      new Date(day.date).toLocaleString('default', { month: 'long', year: 'numeric' }) === month
    );
  };

  const getDayClass = (day: CalendarDay) => {
    let classes = 'h-10 w-10 rounded-full flex items-center justify-center text-sm';
    // Weekend style: always a light green background with weekend text styling.
    if (day.is_weekend) {
      classes += ' bg-green-50 text-gray-400';
      return classes;
    }

    // For Holiday, Planned Leave, or Recommended Leave: always have a light green background.
    if (day.is_public_holiday) {
      if (day.is_preferred_leave_period) {
        classes += ' border-2 border-green-500 text-green-700 font-bold';
      } else if (day.is_unpreferred_leave_period) {
        classes += ' border-2 border-red-500 text-green-700 font-bold';
      } else {
        classes += ' bg-green-50 text-green-700 font-bold';
      }
    } else if (day.is_planned_leave) {
      if (day.is_preferred_leave_period) {
        classes += ' border-2 border-green-500 text-green-700 font-bold';
      } else if (day.is_unpreferred_leave_period) {
        classes += ' border-2 border-red-500 text-green-700 font-bold';
      } else {
        classes += ' bg-green-50 text-green-700 font-bold';
      }
    } else if (day.is_recommended_leave) {
      if (day.is_preferred_leave_period) {
        classes += ' border-2 border-green-500 bg-green-50 text-green-700 font-bold';
      } else if (day.is_unpreferred_leave_period) {
        classes += ' border-2 border-red-500 bg-green-50 text-green-700 font-bold';
      } else {
        classes += ' bg-green-50 text-green-700 font-bold';
      }
    } else if (day.is_preferred_leave_period) {
      classes += ' border-2 border-green-500';
    } else if (day.is_unpreferred_leave_period) {
      classes += ' border-2 border-red-500';
    } else {
      classes += ' hover:bg-gray-50';
    }

    return classes;
  };

  const renderDayContent = (day: CalendarDay) => {
    if (day.is_public_holiday) return 'H';
    if (day.is_planned_leave) return 'L';
    if (day.is_recommended_leave) return 'R';
    return new Date(day.date).getDate();
  };

  return (
    <div className="space-y-8">
      <Legend />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {months.map((month) => (
          <div key={month} className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{month}</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((dayLabel) => (
                  <div key={dayLabel} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                    {dayLabel}
                  </div>
                ))}
                {getMonthDays(month).map((day) => (
                  <div
                    key={day.date}
                    className={getDayClass(day)}
                    title={day.public_holiday_name || day.leave_reason || undefined}
                  >
                    {renderDayContent(day)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
