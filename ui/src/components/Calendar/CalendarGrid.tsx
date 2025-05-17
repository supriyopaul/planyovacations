import React from 'react';
import { Day } from './Day';
import { useLeave } from '../../context/LeaveContext';
import { getCalendarDays } from '../../utils/calendarUtils';
import { CalendarGridProps } from '../../types';

interface CalendarGridWithRangeProps extends CalendarGridProps {
  startDate?: Date | null;
  endDate?: Date | null;
  offDays?: number[];
}

function getMonthsInRange(start: Date, end: Date) {
  const months = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (current <= last) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

export const CalendarGrid: React.FC<CalendarGridWithRangeProps> = ({ currentDate, view, startDate, endDate, offDays = [0, 6] }) => {
  const { events, setIsCreatingEvent, activeEventId, setActiveEventId } = useLeave();
  
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const handleDayClick = () => {
    if (activeEventId) {
      setActiveEventId(null);
    } else {
      setIsCreatingEvent(true);
    }
  };
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('eventId', id);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    console.log(`Event ${eventId} dropped on ${date.toISOString()}`);
  };

  if (view === 'year') {
    if (!startDate || !endDate) {
      return (
        <div className="flex items-center justify-center h-full text-slate-500 text-lg p-8">
          Please select both a start and end date to view the calendar.
        </div>
      );
    }
    const months = getMonthsInRange(startDate, endDate);
    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {months.map((monthDate, monthIndex) => {
          const monthDays = getCalendarDays(monthDate, 'month', events);
          return (
            <div key={monthDate.toISOString()} className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden">
              <div className="p-2 border-b border-slate-300 text-center font-medium">
                {monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <div className="grid grid-cols-7">
                {dayNames.map((day) => (
                  <div 
                    key={day} 
                    className="py-1 text-center text-xs font-medium text-slate-600"
                  >
                    {day}
                  </div>
                ))}
                {monthDays.map((day, dayIndex) => (
                  <Day 
                    key={dayIndex}
                    day={{...day, events: []}}
                    offDays={offDays}
                    onClick={handleDayClick}
                    onDragStart={(e) => day.events.length && handleDragStart(e, day.events[0].id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day.date)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const calendarDays = getCalendarDays(currentDate, view, events);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-300">
        {dayNames.map((day) => (
          <div 
            key={day} 
            className="py-2 text-center text-sm font-medium text-slate-600"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className={`grid grid-cols-7 ${view === 'month' ? 'grid-rows-6' : 'grid-rows-1'}`}>
        {calendarDays.map((day, index) => (
          <Day 
            key={index} 
            day={{...day, events: []}}
            offDays={offDays}
            onClick={handleDayClick}
            onDragStart={(e) => day.events.length && handleDragStart(e, day.events[0].id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, day.date)}
          />
        ))}
      </div>
    </div>
  );
};