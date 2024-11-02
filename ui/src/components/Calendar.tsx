import React from 'react';
import type { CalendarDay } from '../types';

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
    
    if (day.is_weekend) {
      classes += ' bg-gray-100 text-gray-400';
    } else if (day.is_public_holiday) {
      classes += ' bg-purple-100 text-purple-700';
    } else if (day.is_planned_leave) {
      classes += ' bg-green-100 text-green-700';
    } else if (day.is_recommended_leave) {
      classes += ' bg-blue-100 text-blue-700';
    } else if (day.is_preferred_leave_period) {
      classes += ' bg-yellow-100 text-yellow-700';
    } else if (day.is_unpreferred_leave_period) {
      classes += ' bg-red-100 text-red-700';
    } else {
      classes += ' hover:bg-gray-50';
    }

    return classes;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {months.map((month) => (
          <div key={month} className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{month}</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                {getMonthDays(month).map((day, index) => (
                  <div
                    key={day.date}
                    className={getDayClass(day)}
                    title={day.public_holiday_name || day.leave_reason || undefined}
                  >
                    {new Date(day.date).getDate()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-purple-100 mr-2"></div>
          <span className="text-sm text-gray-600">Public Holiday</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-100 mr-2"></div>
          <span className="text-sm text-gray-600">Planned Leave</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-100 mr-2"></div>
          <span className="text-sm text-gray-600">Recommended</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-yellow-100 mr-2"></div>
          <span className="text-sm text-gray-600">Preferred Period</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-red-100 mr-2"></div>
          <span className="text-sm text-gray-600">Unpreferred Period</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;