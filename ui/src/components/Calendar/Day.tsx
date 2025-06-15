import React, { useState } from 'react';
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
  columnIndex?: number;
  daysInWeek?: number;
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
  selectedBrush,
  columnIndex = 0,
  daysInWeek = 7
}) => {
  const { date, isCurrentMonth, isWeekend, isToday, events } = day;
  const [showTooltip, setShowTooltip] = useState(false);
  
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
  
  const hasSuggestedLeave = isCurrentMonth && events.some(e => e.type === EventType.SUGGESTED_LEAVE);
  const suggestedEvent = isCurrentMonth ? events.find(e => e.type === EventType.SUGGESTED_LEAVE) : undefined;
  
  // Debug logging
  if (hasSuggestedLeave && suggestedEvent) {
    console.log('Suggested leave detected:', {
      date: date.toISOString(),
      title: suggestedEvent.title,
      summary: suggestedEvent.suggestion_details_summary,
      efficiency: suggestedEvent.efficiency_report
    });
  }

  const dayClasses = [
    'min-h-[32px] p-1 border-b border-r border-slate-300 transition-colors select-none',
    isCurrentMonth ? 'bg-white' : 'bg-slate-50',
    isCurrentMonth && isWeekend ? 'bg-slate-100' : '',
    isCurrentMonth && isToday ? 'ring-2 ring-inset ring-teal-500' : '',
    isCurrentMonth ? getRangeClasses() : '',
    isCurrentMonth ? (selectedBrush ? getBrushPreviewClass() : isWeekend ? 'hover:bg-slate-200' : 'hover:bg-slate-50') : '',
    hasSuggestedLeave ? 'bg-purple-100' : '',
    isCurrentMonth ? 'cursor-pointer' : '',
  ].filter(Boolean).join(' ');

  const getEventLineColor = (eventType: EventType) => {
    switch (eventType) {
      case EventType.HOLIDAY:
        return 'bg-blue-500';
      case EventType.OPTIONAL_HOLIDAY:
        return 'bg-yellow-500';
      case EventType.PLANNED_LEAVE:
        return 'bg-teal-500';
      case EventType.BUSY_PERIOD:
        return 'bg-red-500';
      case EventType.SLOW_PERIOD:
        return 'bg-orange-500';
      case EventType.SUGGESTED_LEAVE:
        return 'bg-amber-500';
      default:
        return 'bg-slate-500';
    }
  };

  const isOffDay = offDays.includes(date.getDay());

  const getTooltipPositionClass = () => {
    if (columnIndex === 0) return 'left-0 -translate-x-0';
    if (columnIndex === daysInWeek - 1) return 'right-0 translate-x-0';
    return 'left-1/2 -translate-x-1/2';
  };

  // Group events by type to avoid duplicate lines
  const eventsByType = events.reduce((acc, event) => {
    if (!acc[event.type]) {
      acc[event.type] = [];
    }
    acc[event.type].push(event);
    return acc;
  }, {} as Record<EventType, typeof events>);

  // Helper function to determine if an event continues to the next day
  const isEventRangeStart = (event: any) => {
    const eventStart = new Date(event.startDate);
    eventStart.setHours(0, 0, 0, 0);
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
    return eventStart.getTime() === currentDate.getTime();
  };

  const isEventRangeEnd = (event: any) => {
    const eventEnd = new Date(event.endDate);
    eventEnd.setHours(0, 0, 0, 0);
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
    return eventEnd.getTime() === currentDate.getTime();
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isCurrentMonth) {
      if (onMouseEnter) onMouseEnter();
      if (hasSuggestedLeave) {
        setShowTooltip(true);
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isCurrentMonth) {
      if (onMouseEnter) onMouseEnter();
      setShowTooltip(false);
    }
  };

  return (
    <div 
      className={dayClasses}
      onMouseDown={isCurrentMonth ? onMouseDown : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={isCurrentMonth ? onMouseUp : undefined}
    >
      <div className={`relative h-full ${selectedBrush === EventType.ERASER ? 'pointer-events-none' : ''}`}>
        {/* Only show content for current month days */}
        {isCurrentMonth ? (
          <>
            <div className="flex justify-between items-start relative z-10">
              <span className={`text-xs font-medium ${isWeekend ? 'text-slate-400' : ''}`}>{date.getDate()}</span>
            </div>
            
            {/* Tooltip for suggested leave on hover */}
            {hasSuggestedLeave && suggestedEvent && showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50">
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-[240px] max-w-[320px] text-xs text-slate-700">
                  <div className="font-semibold text-purple-700 mb-1">{suggestedEvent.title}</div>
                  {suggestedEvent.suggestion_details_summary && (
                    <div className="text-slate-600 mb-2">{suggestedEvent.suggestion_details_summary}</div>
                  )}
                  
                  {/* Efficiency and vacation details */}
                  {suggestedEvent.efficiency_report && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-2 mb-2">
                      <div className="font-medium text-purple-800 text-xs">{suggestedEvent.efficiency_report}</div>
                    </div>
                  )}
                  
                  {/* Vacation period */}
                  {suggestedEvent.vacation_period && (
                    <div className="text-xs text-slate-600 mb-2">
                      <div className="font-medium">Vacation Period:</div>
                      <div>{new Date(suggestedEvent.vacation_period.start).toLocaleDateString()} - {new Date(suggestedEvent.vacation_period.end).toLocaleDateString()}</div>
                    </div>
                  )}
                  
                  {/* Summary stats */}
                  <div className="text-xs text-slate-500 border-t border-slate-100 pt-2 mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-between">
                        <span>Rank:</span>
                        <span className="font-medium">{suggestedEvent.rank || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Leave Days:</span>
                        <span className="font-medium">{suggestedEvent.leave_days_count || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Days Off:</span>
                        <span className="font-medium">{suggestedEvent.total_vacation_days || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">Suggested</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45"></div>
              </div>
            )}
            
            {/* Event lines at the bottom, but skip suggested_leave */}
            {events.some(e => e.type !== EventType.SUGGESTED_LEAVE) && (
              <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                {Object.entries(eventsByType).map(([eventType, typeEvents], index) => {
                  if (eventType === EventType.SUGGESTED_LEAVE) return null;
                  const event = typeEvents[0];
                  const isStart = isEventRangeStart(event);
                  const isEnd = isEventRangeEnd(event);
                  return (
                    <div key={eventType} className="relative group flex-1">
                      <div 
                        className={`h-full ${getEventLineColor(eventType as EventType)} cursor-pointer transition-opacity hover:opacity-80 ${
                          isStart ? 'rounded-l-sm' : ''
                        } ${
                          isEnd ? 'rounded-r-sm' : ''
                        }`}
                        title={typeEvents.map(e => e.title).join(', ')}
                      />
                      <div className={`absolute bottom-full ${getTooltipPositionClass()} mb-2 hidden group-hover:block z-50 ${selectedBrush === EventType.ERASER ? 'hidden' : ''}`}>
                        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-2 min-w-[200px] max-w-[300px]">
                          {typeEvents.map((event, eventIndex) => (
                            <div key={event.id} className={`${eventIndex > 0 ? 'mt-1 pt-1 border-t border-slate-100' : ''}`}>
                              <EventBadge event={event} />
                            </div>
                          ))}
                        </div>
                        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-2 h-2 bg-white border-r border-b border-slate-200 rotate-45"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};