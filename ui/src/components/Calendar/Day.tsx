import React from 'react';
import { EventType, DayProps } from '../../types';

interface DayWithOffProps extends DayProps {
  offDays?: number[];
  isDragSelected?: boolean;
  onMouseDown?: () => void;
  onMouseEnter?: () => void;
  onMouseUp?: () => void;
}

export const Day: React.FC<DayWithOffProps> = ({ 
  day, 
  offDays = [0, 6],
  isDragSelected = false,
  onMouseDown,
  onMouseEnter,
  onMouseUp
}) => {
  const { date, isCurrentMonth, isWeekend, isToday, events } = day;
  
  const dayClasses = [
    'min-h-[32px] p-1 border-b border-r border-slate-300 transition-colors select-none',
    isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400',
    isWeekend ? 'bg-slate-100' : '',
    isToday ? 'ring-2 ring-inset ring-teal-500' : '',
    isDragSelected ? 'ring-2 ring-blue-400 z-20' : '',
    'hover:bg-slate-50'
  ].join(' ');
  
  const getSpecialBackground = () => {
    const specialEvent = events.find(event => 
      event.type === EventType.HOLIDAY || 
      event.type === EventType.OPTIONAL_HOLIDAY ||
      event.type === EventType.PLANNED_LEAVE ||
      event.type === EventType.BUSY_PERIOD ||
      event.type === EventType.SLOW_PERIOD
    );
    
    if (!specialEvent) return null;
    
    switch (specialEvent.type) {
      case EventType.HOLIDAY:
        return <div className="absolute inset-0 bg-blue-100 opacity-60 pointer-events-none" />;
      case EventType.OPTIONAL_HOLIDAY:
        return <div className="absolute inset-0 bg-yellow-100 opacity-60 pointer-events-none" />;
      case EventType.PLANNED_LEAVE:
        return <div className="absolute inset-0 bg-teal-100 opacity-60 pointer-events-none" />;
      case EventType.BUSY_PERIOD:
        return <div className="absolute inset-0 bg-red-100 opacity-60 pointer-events-none" />;
      case EventType.SLOW_PERIOD:
        return <div className="absolute inset-0 bg-amber-100 opacity-60 pointer-events-none" />;
      default:
        return null;
    }
  };

  const isOffDay = offDays.includes(date.getDay());

  return (
    <div 
      className={dayClasses}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
    >
      <div className="relative h-full">
        {getSpecialBackground()}
        
        <div className="flex justify-between items-start relative z-10">
          <span className={`text-xs font-medium ${isOffDay ? 'text-slate-400' : ''}`}>{date.getDate()}</span>
          
          {events.length > 0 && (
            <span className="text-[10px] font-medium bg-slate-200 rounded-full h-4 w-4 flex items-center justify-center">
              {events.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};