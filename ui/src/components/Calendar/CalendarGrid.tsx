import React from 'react';
import { Day } from './Day';
import { useLeave } from '../../context/LeaveContext';
import { getCalendarDays, isSameDay } from '../../utils/calendarUtils';
import { CalendarGridProps, EventType } from '../../types';
import { EventModal } from '../Modals/EventModal';

interface CalendarGridWithRangeProps extends CalendarGridProps {
  startDate?: Date | null;
  endDate?: Date | null;
  offDays?: number[];
  selectedBrush: EventType | null;
  setSelectedBrush: (brush: EventType | null) => void;
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

export const CalendarGrid: React.FC<CalendarGridWithRangeProps> = ({ currentDate, view, startDate, endDate, offDays = [0, 6], selectedBrush, setSelectedBrush }) => {
  const { events, setIsCreatingEvent, activeEventId, setActiveEventId, deleteEvent } = useLeave();
  
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Drag-to-mark state
  const [dragStart, setDragStart] = React.useState<Date | null>(null);
  const [dragEnd, setDragEnd] = React.useState<Date | null>(null);
  const [dragging, setDragging] = React.useState(false);

  // Helper: is date in drag range
  const isInDragRange = (date: Date) => {
    if (!dragStart || !dragEnd) return false;
    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart > dragEnd ? dragStart : dragEnd;
    return date >= start && date <= end;
  };

  // Mouse event handlers for drag-to-mark
  const handleDayMouseDown = (date: Date) => {
    if (!selectedBrush) return;
    setDragStart(date);
    setDragEnd(date);
    setDragging(true);
  };
  const handleDayMouseEnter = (date: Date) => {
    if (dragging) setDragEnd(date);
  };
  const handleDayMouseUp = (date: Date) => {
    if (dragging && dragStart) {
      setDragEnd(date);
      setDragging(false);
      const rangeStart = dragStart < date ? dragStart : date;
      const rangeEnd = dragStart > date ? dragStart : date;
      if (selectedBrush) {
        // Get all dates in the range
        const datesInRange: Date[] = [];
        let d = new Date(rangeStart);
        while (d <= rangeEnd) {
          datesInRange.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
        // Check if all dates are already marked with selectedBrush
        const allMarked = datesInRange.every(dayDate =>
          events.some(ev =>
            ev.type === selectedBrush &&
            dayDate >= new Date(ev.startDate) &&
            dayDate <= new Date(ev.endDate)
          )
        );
        if (allMarked) {
          // Find all events of this type that overlap with the range and delete them
          const eventsToDelete = events.filter(ev =>
            ev.type === selectedBrush &&
            (
              (new Date(ev.startDate) <= rangeEnd && new Date(ev.endDate) >= rangeStart)
            )
          );
          eventsToDelete.forEach(ev => deleteEvent(ev.id));
          return; // Do not open modal
        }
      }
      // Open modal for event creation with selectedBrush, dragStart, dragEnd
      setModalRange({
        start: rangeStart,
        end: rangeEnd
      });
      setModalType(selectedBrush);
      setShowModal(true);
    }
  };
  React.useEffect(() => {
    if (!dragging) setDragStart(null);
  }, [dragging]);
  
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

  // Modal state for event creation after drag
  const [showModal, setShowModal] = React.useState(false);
  const [modalRange, setModalRange] = React.useState<{start: Date, end: Date} | null>(null);
  const [modalType, setModalType] = React.useState<EventType | null>(null);

  // Modal close handler
  const handleModalClose = () => {
    setShowModal(false);
    setModalRange(null);
    setModalType(null);
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
      <>
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
                      day={day}
                      offDays={offDays}
                      isDragSelected={isInDragRange(day.date)}
                      onMouseDown={() => handleDayMouseDown(day.date)}
                      onMouseEnter={() => handleDayMouseEnter(day.date)}
                      onMouseUp={() => handleDayMouseUp(day.date)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {showModal && modalRange && modalType && (
          <EventModal 
            open={showModal}
            onClose={handleModalClose}
            eventType={modalType}
            startDate={modalRange.start}
            endDate={modalRange.end}
          />
        )}
      </>
    );
  }

  const calendarDays = getCalendarDays(currentDate, view, events);
  
  return (
    <>
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
              day={day}
              offDays={offDays}
              isDragSelected={isInDragRange(day.date)}
              onMouseDown={() => handleDayMouseDown(day.date)}
              onMouseEnter={() => handleDayMouseEnter(day.date)}
              onMouseUp={() => handleDayMouseUp(day.date)}
            />
          ))}
        </div>
      </div>
      {showModal && modalRange && modalType && (
        <EventModal 
          open={showModal}
          onClose={handleModalClose}
          eventType={modalType}
          startDate={modalRange.start}
          endDate={modalRange.end}
        />
      )}
    </>
  );
};