import React, { useState, useCallback } from 'react';
import { Day } from './Day';
import { useLeave } from '../../context/LeaveContext';
import { getCalendarDays, isSameDay } from '../../utils/calendarUtils';
import { CalendarGridProps, EventType, CalendarView } from '../../types';
import { EventCreationModal } from '../Modals/EventCreationModal';

interface DragState {
  isDragging: boolean;
  startDate: Date | null;
  endDate: Date | null;
  initialDate: Date | null;
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

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  view = 'year',
  startDate,
  endDate,
  offDays = [0, 6],
  selectedBrush,
  setSelectedBrush
}) => {
  const { events, addEvent } = useLeave();
  
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startDate: null,
    endDate: null,
    initialDate: null
  });

  const isDateInRange = useCallback((date: Date) => {
    if (!dragState.startDate || !dragState.endDate) return false;
    
    const start = new Date(Math.min(dragState.startDate.getTime(), dragState.endDate.getTime()));
    const end = new Date(Math.max(dragState.startDate.getTime(), dragState.endDate.getTime()));
    
    // Normalize dates to start of day for comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return checkDate >= start && checkDate <= end;
  }, [dragState.startDate, dragState.endDate]);

  const isRangeStart = useCallback((date: Date) => {
    if (!dragState.startDate || !dragState.endDate) return false;
    const start = new Date(Math.min(dragState.startDate.getTime(), dragState.endDate.getTime()));
    return date.getTime() === start.getTime();
  }, [dragState.startDate, dragState.endDate]);

  const isRangeEnd = useCallback((date: Date) => {
    if (!dragState.startDate || !dragState.endDate) return false;
    const end = new Date(Math.max(dragState.startDate.getTime(), dragState.endDate.getTime()));
    return date.getTime() === end.getTime();
  }, [dragState.startDate, dragState.endDate]);

  const handleMouseDown = useCallback((date: Date) => {
    if (!selectedBrush) return;
    
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    setDragState({
      isDragging: true,
      startDate: normalizedDate,
      endDate: normalizedDate,
      initialDate: normalizedDate
    });
  }, [selectedBrush]);

  const handleMouseEnter = useCallback((date: Date) => {
    if (!dragState.isDragging || !dragState.initialDate) return;
    
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    setDragState(prev => ({
      ...prev,
      startDate: prev.initialDate,
      endDate: normalizedDate
    }));
  }, [dragState.isDragging, dragState.initialDate]);

  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging || !dragState.startDate || !dragState.endDate || !selectedBrush) return;
    
    // Don't show modal for eraser
    if (selectedBrush === EventType.ERASER) {
      // Handle eraser logic here
      setDragState({
        isDragging: false,
        startDate: null,
        endDate: null,
        initialDate: null
      });
      return;
    }

    // Get the actual start and end dates (ordered)
    const start = new Date(Math.min(dragState.startDate.getTime(), dragState.endDate.getTime()));
    const end = new Date(Math.max(dragState.startDate.getTime(), dragState.endDate.getTime()));
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Show the event creation modal
    setModalData({
      type: selectedBrush,
      startDate: start,
      endDate: end
    });
    setShowEventModal(true);

    // Clear the drag state
    setDragState({
      isDragging: false,
      startDate: null,
      endDate: null,
      initialDate: null
    });
  }, [dragState.isDragging, dragState.startDate, dragState.endDate, selectedBrush]);

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

  const [showEventModal, setShowEventModal] = useState(false);
  const [modalData, setModalData] = useState<{
    type: EventType;
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const handleEventCreate = (data: { title: string; type: EventType; startDate: Date; endDate: Date }) => {
    addEvent({
      title: data.title,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate
    });

    setShowEventModal(false);
    setModalData(null);
  };

  const handleEventModalClose = () => {
    setShowEventModal(false);
    setModalData(null);
  };

  const getGridRowsClass = (view: CalendarView) => {
    switch (view) {
      case 'year':
        return 'grid-rows-6';
      case 'week':
        return 'grid-rows-1';
      case 'month':
        return 'grid-rows-6';
      default:
        return '';
    }
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
                      isDragSelected={isDateInRange(day.date)}
                      isRangeStart={isRangeStart(day.date)}
                      isRangeEnd={isRangeEnd(day.date)}
                      isInRange={isDateInRange(day.date)}
                      onMouseDown={() => handleMouseDown(day.date)}
                      onMouseEnter={() => handleMouseEnter(day.date)}
                      onMouseUp={handleMouseUp}
                      selectedBrush={selectedBrush}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {showEventModal && modalData && (
          <EventCreationModal
            open={showEventModal}
            onClose={handleEventModalClose}
            onSubmit={handleEventCreate}
            eventType={modalData.type}
            startDate={modalData.startDate}
            endDate={modalData.endDate}
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
        
        <div className={`grid grid-cols-7 ${getGridRowsClass(view)}`}>
          {calendarDays.map((day, index) => (
            <Day 
              key={index} 
              day={day}
              offDays={offDays}
              isDragSelected={dragState.isDragging && day.date.getTime() === dragState.endDate?.getTime()}
              isRangeStart={isRangeStart(day.date)}
              isRangeEnd={isRangeEnd(day.date)}
              isInRange={isDateInRange(day.date)}
              onMouseDown={() => handleMouseDown(day.date)}
              onMouseEnter={() => handleMouseEnter(day.date)}
              onMouseUp={handleMouseUp}
              selectedBrush={selectedBrush}
            />
          ))}
        </div>
      </div>
      {showEventModal && modalData && (
        <EventCreationModal
          open={showEventModal}
          onClose={handleEventModalClose}
          onSubmit={handleEventCreate}
          eventType={modalData.type}
          startDate={modalData.startDate}
          endDate={modalData.endDate}
        />
      )}
    </>
  );
};