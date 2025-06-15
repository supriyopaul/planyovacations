import React, { useState } from 'react';
import { CalendarGrid } from './CalendarGrid';
import { EventModal } from '../Modals/EventModal';
import { useLeave } from '../../context/LeaveContext';

interface CalendarProps {
  offDays: number[];
  selectedBrush: import('../../types').EventType | null;
  setSelectedBrush: (brush: import('../../types').EventType | null) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ offDays, selectedBrush, setSelectedBrush }) => {
  const { 
    currentDate, 
    calendarView, 
    isCreatingEvent,
    activeEventId,
    startDate,
    endDate,
    events,
    suggestedLeave
  } = useLeave();

  // Merge events and suggestedLeave for rendering
  const allEvents = [...events, ...suggestedLeave];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <CalendarGrid 
          currentDate={currentDate} 
          view={calendarView} 
          startDate={startDate} 
          endDate={endDate} 
          offDays={offDays} 
          selectedBrush={selectedBrush} 
          setSelectedBrush={setSelectedBrush}
          events={allEvents} // Pass merged events
        />
      </div>
      
      {/* Event creation/edit modal */}
      {(isCreatingEvent || activeEventId) && <EventModal />}
    </div>
  );
};