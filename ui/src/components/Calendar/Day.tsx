import React from 'react';
import { EventType, DayProps } from '../../types';
import { EventBadge } from '../EventBadge';

interface DayWithOffProps extends DayProps {
  offDays?: number[];
  isDragSelected?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
  isInRange?: boolean;
  onMouseDown?: () => void;
  onMouseEnter?: () => void;
  onMouseUp?: () => void;
  selectedBrush?: EventType | null;
}

export const Day: React.FC<DayWithOffProps> = ({ 
  day, 
  offDays = [0, 6],
  isDragSelected = false,
  isRangeStart = false,
  isRangeEnd = false,
  isInRange = false,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  selectedBrush
}) => {
  const { date, isCurrentMonth, isWeekend, isToday, events } = day;
  
  const getBrushPreviewClass = () => {
    if (!selectedBrush) return '';
    
    const baseHoverClass = isWeekend ? 'bg-slate-100' : '';
    
    switch (selectedBrush) {
      case EventType.HOLIDAY:
        return `${baseHoverClass} hover:bg-blue-50 hover:ring-1 hover:ring-blue-200`;
      case EventType.OPTIONAL_HOLIDAY:
        return `${baseHoverClass} hover:bg-yellow-50 hover:ring-1 hover:ring-yellow-200`;
      case EventType.PLANNED_LEAVE:
        return `${baseHoverClass} hover:bg-teal-50 hover:ring-1 hover:ring-teal-200`;
      case EventType.BUSY_PERIOD:
        return `${baseHoverClass} hover:bg-red-50 hover:ring-1 hover:ring-red-200`;
      case EventType.SLOW_PERIOD:
        return `${baseHoverClass} hover:bg-orange-50 hover:ring-1 hover:ring-orange-200`;
      case EventType.ERASER:
        return `${baseHoverClass} hover:bg-slate-50 hover:ring-1 hover:ring-slate-200`;
      default:
        return baseHoverClass;
    }
  };

  const getRangeClasses = () => {
    if (!isDragSelected && !isInRange) return '';
    
    const classes = [];
    
    if (isRangeStart) {
      classes.push('rounded-l-md');
    }
    if (isRangeEnd) {
      classes.push('rounded-r-md');
    }
    if (isInRange) {
      classes.push('bg-blue-50');
    }
    if (isDragSelected) {
      classes.push('ring-2 ring-blue-400 z-20');
    }
    
    return classes.join(' ');
  };
  
  const dayClasses = [
    'min-h-[32px] p-1 border-b border-r border-slate-300 transition-colors select-none',
    isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400',
    isWeekend ? 'bg-slate-100' : '',
    isToday ? 'ring-2 ring-inset ring-teal-500' : '',
    getRangeClasses(),
    selectedBrush ? getBrushPreviewClass() : isWeekend ? 'hover:bg-slate-200' : 'hover:bg-slate-50',
    'cursor-pointer'
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
        return <div className="absolute inset-0 bg-orange-100 opacity-60 pointer-events-none" />;
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
            <div className="relative group">
              <span className="text-[10px] font-medium bg-slate-200 rounded-full h-4 w-4 flex items-center justify-center">
                {events.length}
              </span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-2 min-w-[200px] max-w-[300px]">
                  {events.map((event, index) => (
                    <div key={event.id} className={`${index > 0 ? 'mt-1 pt-1 border-t border-slate-100' : ''}`}>
                      <EventBadge event={event} />
                    </div>
                  ))}
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};