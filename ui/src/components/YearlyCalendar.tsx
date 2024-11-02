import React, { useState } from 'react';
import { CalendarDay } from '../types';
import DateActionForm from './DateActionForm';

interface YearlyCalendarProps {
  days: CalendarDay[];
  onDateClick: (date: string, name: string, type: 'holiday' | 'leave', endDate?: string) => void;
}

const YearlyCalendar: React.FC<YearlyCalendarProps> = ({ days, onDateClick }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const groupByMonth = (days: CalendarDay[]) => {
    const grouped: { [key: string]: CalendarDay[] } = {};
    days.forEach(day => {
      const date = new Date(day.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(day);
    });
    return grouped;
  };

  const getMonthGrid = (monthDays: CalendarDay[]) => {
    if (!monthDays.length) return [];
    
    const firstDate = new Date(monthDays[0].date);
    const firstDay = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1).getDay();
    const grid: (CalendarDay | null)[] = Array(firstDay).fill(null);
    
    monthDays.forEach(day => {
      grid.push(day);
    });
    
    return grid;
  };

  const getDayClass = (day: CalendarDay | null) => {
    if (!day) return 'invisible';
    
    let classes = 'relative group h-8 w-8 rounded-full flex items-center justify-center text-sm cursor-pointer transition-colors ';
    
    if (day.date === selectedDate) {
      classes += 'ring-2 ring-indigo-500 ring-offset-2 ';
    }
    
    if (day.is_weekend) {
      classes += 'bg-gray-100 text-gray-500 hover:bg-gray-200 ';
    } else if (day.is_public_holiday) {
      classes += 'bg-purple-100 text-purple-800 hover:bg-purple-200 ';
    } else if (day.is_planned_leave) {
      classes += 'bg-green-100 text-green-800 hover:bg-green-200 ';
    } else if (day.is_recommended_leave) {
      classes += 'bg-blue-100 text-blue-800 hover:bg-blue-200 ';
    } else if (day.is_preferred_leave_period) {
      classes += 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ';
    } else if (day.is_unpreferred_leave_period) {
      classes += 'bg-red-100 text-red-800 hover:bg-red-200 ';
    } else {
      classes += 'hover:bg-gray-100 ';
    }
    
    return classes;
  };

  const handleDateClick = (date: string) => {
    setError(null);
    if (selectedDate === date) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  const handleDateAction = async (date: string, name: string, type: 'holiday' | 'leave', endDate?: string) => {
    try {
      await onDateClick(date, name, type, endDate);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const groupedDays = groupByMonth(days);

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-4 justify-center">
        {[
          { label: 'Weekend', class: 'bg-gray-100' },
          { label: 'Public Holiday', class: 'bg-purple-100' },
          { label: 'Planned Leave', class: 'bg-green-100' },
          { label: 'Recommended', class: 'bg-blue-100' },
          { label: 'Preferred Period', class: 'bg-yellow-100' },
          { label: 'Unpreferred Period', class: 'bg-red-100' }
        ].map((legend) => (
          <div key={legend.label} className="flex items-center space-x-2">
            <div className={`h-4 w-4 rounded-full ${legend.class}`}></div>
            <span className="text-sm text-gray-600">{legend.label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(groupedDays).map(([monthKey, monthDays]) => {
          const [year, month] = monthKey.split('-');
          const monthName = months[parseInt(month)];
          const grid = getMonthGrid(monthDays);

          return (
            <div key={monthKey} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-4">{`${monthName} ${year}`}</h3>
              <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                {grid.map((day, index) => (
                  <div key={index} className="relative">
                    {day && (
                      <div
                        className={getDayClass(day)}
                        onClick={() => handleDateClick(day.date)}
                      >
                        {day ? new Date(day.date).getDate() : ''}
                        <div className="hidden group-hover:block absolute z-10 -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {day.is_public_holiday ? day.public_holiday_name :
                           day.is_planned_leave ? day.leave_reason :
                           'Click to add holiday or leave'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <DateActionForm
          date={selectedDate}
          onSubmit={handleDateAction}
          onCancel={() => setSelectedDate(null)}
        />
      )}

    </div>
  );
};

export default YearlyCalendar;