import React from 'react';
import { CalendarGrid } from './CalendarGrid';
import { EventModal } from '../Modals/EventModal';
import { useLeave } from '../../context/LeaveContext';

export const Calendar: React.FC = () => {
  const { 
    currentDate, 
    calendarView, 
    isCreatingEvent,
    activeEventId,
    startDate,
    endDate
  } = useLeave();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <CalendarGrid currentDate={currentDate} view={calendarView} startDate={startDate} endDate={endDate} />
      </div>
      
      {/* Event creation/edit modal */}
      {(isCreatingEvent || activeEventId) && <EventModal />}
    </div>
  );
};