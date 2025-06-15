import React, { useState, useCallback } from 'react';
import { Day } from './Day';
import { useLeave } from '../../context/LeaveContext';
import { getCalendarDays, isSameDay, doDatesOverlap } from '../../utils/calendarUtils';
import { CalendarGridProps, EventType, CalendarView, LeaveEvent } from '../../types';
import { EventCreationModal } from '../Modals/EventCreationModal';
import { EraserConfirmationModal } from '../Modals/EraserConfirmationModal';

interface DragState {
  isDragging: boolean;
  startDate: Date | null;
  endDate: Date | null;
  initialDate: Date | null;
}

function getMonthsInRange(start: Date, end: Date) {
  const months = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (current <= last) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

export const CalendarGrid: React.FC<CalendarGridProps & { events?: LeaveEvent[] }> = ({
  currentDate,
  view = 'year',
  startDate,
  endDate,
  offDays = [0, 6],
  selectedBrush,
  setSelectedBrush,
  events: propEvents
}) => {
  const context = useLeave();
  const events = propEvents || context.events;
  
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startDate: null,
    endDate: null,
    initialDate: null
  });

  const [showEventModal, setShowEventModal] = useState(false);
  const [modalData, setModalData] = useState<{
    type: EventType;
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const [eraserModalData, setEraserModalData] = useState<{
    open: boolean;
    startDate: Date;
    endDate: Date;
    eventsToErase: LeaveEvent[];
  } | null>(null);

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
    
    const start = new Date(Math.min(dragState.startDate.getTime(), dragState.endDate.getTime()));
    const end = new Date(Math.max(dragState.startDate.getTime(), dragState.endDate.getTime()));
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (selectedBrush === EventType.ERASER) {
      const eventsToErase = events.filter(event => 
        doDatesOverlap(event.startDate, event.endDate, start, end)
      );

      if (eventsToErase.length > 0) {
        setEraserModalData({
          open: true,
          startDate: start,
          endDate: end,
          eventsToErase
        });
      }

      setDragState({
        isDragging: false,
        startDate: null,
        endDate: null,
        initialDate: null
      });
      return;
    }

    // Show the event creation modal for other brushes
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
  }, [dragState.isDragging, dragState.startDate, dragState.endDate, selectedBrush, events]);

  const handleEraserConfirm = useCallback(() => {
    if (!eraserModalData) return;

    try {
      context.eraseEventsInRange(eraserModalData.startDate, eraserModalData.endDate);
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        startDate: null,
        endDate: null,
        initialDate: null
      }));
    } catch (error) {
      console.error('Error erasing events:', error);
    }

    setEraserModalData(null);
  }, [eraserModalData, context.eraseEventsInRange]);

  const handleEraserCancel = useCallback(() => {
    setEraserModalData(null);
  }, []);

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

  const handleEventCreate = (data: { title: string; type: EventType; startDate: Date; endDate: Date }) => {
    context.addEvent({
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

  // Add a separate render function for the modal
  const renderEraserModal = () => {
    if (!eraserModalData?.open) return null;

    return (
      <EraserConfirmationModal
        key={`eraser-modal-${eraserModalData.startDate.getTime()}-${eraserModalData.endDate.getTime()}`}
        open={eraserModalData.open}
        onClose={handleEraserCancel}
        onConfirm={handleEraserConfirm}
        eventsToErase={eraserModalData.eventsToErase}
        startDate={eraserModalData.startDate}
        endDate={eraserModalData.endDate}
      />
    );
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
                      columnIndex={dayIndex % 7}
                      daysInWeek={7}
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
        {renderEraserModal()}
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
              columnIndex={index % 7}
              daysInWeek={7}
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

      {renderEraserModal()}
    </>
  );
};