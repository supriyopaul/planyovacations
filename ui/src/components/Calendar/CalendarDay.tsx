import React from 'react';
import { format } from 'date-fns';
import { Circle } from 'lucide-react';

interface DayProps {
  date: Date;
  isWeekend: boolean;
  isPublicHoliday: boolean;
  holidayName?: string;
  isToday: boolean;
  isPlannedLeave: boolean;
  isRecommended: boolean;
  onClick?: () => void;
}

export function CalendarDay({
  date,
  isWeekend,
  isPublicHoliday,
  holidayName,
  isToday,
  isPlannedLeave,
  isRecommended,
  onClick,
}: DayProps) {
  const dayClasses = `
    relative w-full aspect-square rounded-lg p-2
    flex flex-col items-center justify-center gap-1
    transition-all duration-200
    ${isWeekend ? 'bg-gray-50' : 'bg-white'}
    ${isPublicHoliday ? 'bg-blue-50' : ''}
    ${isPlannedLeave ? 'bg-green-50' : ''}
    ${isRecommended ? 'bg-amber-50' : ''}
    ${isToday ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}
    hover:bg-gray-100 cursor-pointer
  `;

  return (
    <button className={dayClasses} onClick={onClick}>
      <span className="text-sm font-medium text-gray-900">
        {format(date, 'd')}
      </span>
      {isPublicHoliday && (
        <Circle className="w-1.5 h-1.5 fill-blue-500 text-blue-500" />
      )}
      {(isPublicHoliday || isPlannedLeave) && (
        <span className="absolute bottom-1 left-1 right-1 text-[10px] truncate text-gray-600">
          {holidayName || 'Leave'}
        </span>
      )}
    </button>
  );
}