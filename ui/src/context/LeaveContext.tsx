import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LeaveEvent, EventType, LeaveBalance, CalendarView } from '../types';
import { generateMockData } from '../utils/mockData';
import { doDatesOverlap } from '../utils/calendarUtils';

interface LeaveContextType {
  events: LeaveEvent[];
  addEvent: (event: Omit<LeaveEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<LeaveEvent>) => void;
  deleteEvent: (id: string) => void;
  eraseEventsInRange: (startDate: Date, endDate: Date) => LeaveEvent[];
  leaveBalance: LeaveBalance;
  setLeaveBalance: (balance: LeaveBalance) => void;
  isCreatingEvent: boolean;
  setIsCreatingEvent: (value: boolean) => void;
  calendarView: CalendarView;
  setCalendarView: (view: CalendarView) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  suggestedLeave: LeaveEvent[];
  generateSuggestions: () => void;
  activeEventId: string | null;
  setActiveEventId: (id: string | null) => void;
  startDate: Date | null;
  endDate: Date | null;
  setDateRange: (start: Date | null, end: Date | null) => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

// Helper function to get overlapping events
const getOverlappingEvents = (events: LeaveEvent[], startDate: Date, endDate: Date, type: EventType): LeaveEvent[] => {
  return events.filter(event => {
    // Consider holiday types, work period types, and planned leave for mutual exclusivity
    if ((event.type === EventType.HOLIDAY || event.type === EventType.OPTIONAL_HOLIDAY || event.type === EventType.PLANNED_LEAVE) ||
        (event.type === EventType.BUSY_PERIOD || event.type === EventType.SLOW_PERIOD)) {
      return doDatesOverlap(event.startDate, event.endDate, startDate, endDate);
    }
    return false;
  });
};

// Helper function to merge overlapping events of the same type
const mergeSameTypeEvents = (events: LeaveEvent[], newEvent: Omit<LeaveEvent, 'id'>, type: EventType): LeaveEvent[] => {
  // Get all events of the same type that overlap with the new event
  const overlappingEvents = events.filter(event => 
    event.type === type && 
    doDatesOverlap(event.startDate, event.endDate, newEvent.startDate, newEvent.endDate)
  );

  if (overlappingEvents.length === 0) {
    return [...events, { ...newEvent, id: Math.random().toString(36).substr(2, 9) }];
  }

  // Find the earliest start and latest end date
  const mergedStart = new Date(Math.min(
    ...overlappingEvents.map(e => e.startDate.getTime()),
    newEvent.startDate.getTime()
  ));
  const mergedEnd = new Date(Math.max(
    ...overlappingEvents.map(e => e.endDate.getTime()),
    newEvent.endDate.getTime()
  ));

  // Remove ALL events of the same type that overlap with the merged date range
  const remainingEvents = events.filter(event => 
    event.type !== type || 
    !doDatesOverlap(event.startDate, event.endDate, mergedStart, mergedEnd)
  );

  // Add the merged event with the new event's title
  return [...remainingEvents, {
    ...newEvent,
    id: Math.random().toString(36).substr(2, 9),
    startDate: mergedStart,
    endDate: mergedEnd
  }];
};

// Helper function to handle planned leave and holiday conversion
const handlePlannedLeaveConversion = (events: LeaveEvent[], newEvent: Omit<LeaveEvent, 'id'>): LeaveEvent[] => {
  // Get all overlapping holiday and planned leave events
  const overlappingEvents = events.filter(event => 
    (event.type === EventType.HOLIDAY || event.type === EventType.OPTIONAL_HOLIDAY || event.type === EventType.PLANNED_LEAVE) &&
    doDatesOverlap(event.startDate, event.endDate, newEvent.startDate, newEvent.endDate)
  );

  if (overlappingEvents.length === 0) {
    return [...events, { ...newEvent, id: Math.random().toString(36).substr(2, 9) }];
  }

  // Remove ALL events of holiday/leave types that overlap with the new event's date range
  const remainingEvents = events.filter(event => 
    (event.type !== EventType.HOLIDAY && 
     event.type !== EventType.OPTIONAL_HOLIDAY && 
     event.type !== EventType.PLANNED_LEAVE) ||
    !doDatesOverlap(event.startDate, event.endDate, newEvent.startDate, newEvent.endDate)
  );

  // Add the new event
  return [...remainingEvents, { ...newEvent, id: Math.random().toString(36).substr(2, 9) }];
};

// Helper function to handle holiday type conversion
const handleHolidayConversion = (events: LeaveEvent[], newEvent: Omit<LeaveEvent, 'id'>): LeaveEvent[] => {
  // Get all overlapping holiday events
  const overlappingEvents = events.filter(event => 
    (event.type === EventType.HOLIDAY || event.type === EventType.OPTIONAL_HOLIDAY) &&
    doDatesOverlap(event.startDate, event.endDate, newEvent.startDate, newEvent.endDate)
  );

  if (overlappingEvents.length === 0) {
    return [...events, { ...newEvent, id: Math.random().toString(36).substr(2, 9) }];
  }

  // Remove ALL events of holiday types that overlap with the new event's date range
  const remainingEvents = events.filter(event => 
    (event.type !== EventType.HOLIDAY && event.type !== EventType.OPTIONAL_HOLIDAY) ||
    !doDatesOverlap(event.startDate, event.endDate, newEvent.startDate, newEvent.endDate)
  );

  // Add the new event
  return [...remainingEvents, { ...newEvent, id: Math.random().toString(36).substr(2, 9) }];
};

// Helper function to handle work period type conversion
const handleWorkPeriodConversion = (events: LeaveEvent[], newEvent: Omit<LeaveEvent, 'id'>): LeaveEvent[] => {
  // Get all overlapping work period events
  const overlappingEvents = events.filter(event => 
    (event.type === EventType.BUSY_PERIOD || event.type === EventType.SLOW_PERIOD) &&
    doDatesOverlap(event.startDate, event.endDate, newEvent.startDate, newEvent.endDate)
  );

  if (overlappingEvents.length === 0) {
    return [...events, { ...newEvent, id: Math.random().toString(36).substr(2, 9) }];
  }

  // Remove ALL events of work period types that overlap with the new event's date range
  const remainingEvents = events.filter(event => 
    (event.type !== EventType.BUSY_PERIOD && event.type !== EventType.SLOW_PERIOD) ||
    !doDatesOverlap(event.startDate, event.endDate, newEvent.startDate, newEvent.endDate)
  );

  // Add the new event
  return [...remainingEvents, { ...newEvent, id: Math.random().toString(36).substr(2, 9) }];
};

// Helper function to check if a date is a weekend
const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

// Helper function to calculate business days between two dates (excluding weekends)
const calculateBusinessDays = (start: Date, end: Date): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  let businessDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (!isWeekend(currentDate)) {
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
};

// Helper function to recalculate leave balance based on all planned leave events
const recalculateLeaveBalance = (events: LeaveEvent[]): LeaveBalance => {
  const plannedLeaveEvents = events.filter(event => event.type === EventType.PLANNED_LEAVE);
  const totalPlannedDays = plannedLeaveEvents.reduce((total, event) => {
    return total + calculateBusinessDays(event.startDate, event.endDate);
  }, 0);

  return {
    total: 25, // Keep total fixed at 25
    used: 0,   // Used will be calculated separately when events are marked as used
    planned: totalPlannedDays,
    remaining: 25 - totalPlannedDays
  };
};

export const LeaveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<LeaveEvent[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    total: 25,
    used: 0,
    planned: 0,
    remaining: 25
  });
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarView>('year');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [suggestedLeave, setSuggestedLeave] = useState<LeaveEvent[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Set default start and end date to this year's start and end on initial load
  useEffect(() => {
    if (!startDate || !endDate) {
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31);
      setStartDate(yearStart);
      setEndDate(yearEnd);
    }
  }, []);

  // Update leave balance whenever events change
  useEffect(() => {
    setLeaveBalance(recalculateLeaveBalance(events));
  }, [events]);

  const addEvent = (event: Omit<LeaveEvent, 'id'>) => {
    // Normalize dates to start of day
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const normalizedEvent = {
      ...event,
      startDate: start,
      endDate: end
    };

    // Handle different event types
    if (event.type === EventType.HOLIDAY || event.type === EventType.OPTIONAL_HOLIDAY || event.type === EventType.PLANNED_LEAVE) {
      // If there are any overlapping events of different holiday/leave types, handle conversion
      const hasDifferentTypeOverlap = events.some(e => 
        (e.type === EventType.HOLIDAY || e.type === EventType.OPTIONAL_HOLIDAY || e.type === EventType.PLANNED_LEAVE) &&
        e.type !== event.type &&
        doDatesOverlap(e.startDate, e.endDate, start, end)
      );

      if (hasDifferentTypeOverlap) {
        setEvents(handlePlannedLeaveConversion(events, normalizedEvent));
      } else {
        // Merge with same type events
        setEvents(mergeSameTypeEvents(events, normalizedEvent, event.type));
      }
    } else if (event.type === EventType.BUSY_PERIOD || event.type === EventType.SLOW_PERIOD) {
      // If there are any overlapping events of different work period types, handle conversion
      const hasDifferentTypeOverlap = events.some(e => 
        (e.type === EventType.BUSY_PERIOD || event.type === EventType.SLOW_PERIOD) &&
        e.type !== event.type &&
        doDatesOverlap(e.startDate, e.endDate, start, end)
      );

      if (hasDifferentTypeOverlap) {
        setEvents(handleWorkPeriodConversion(events, normalizedEvent));
      } else {
        // Merge with same type events
        setEvents(mergeSameTypeEvents(events, normalizedEvent, event.type));
      }
    } else {
      // For other types (e.g., SUGGESTED_LEAVE), add as normal
      const newEvent = {
        ...normalizedEvent,
        id: Math.random().toString(36).substr(2, 9)
      };
      setEvents([...events, newEvent]);
    }
  };

  const updateEvent = (id: string, updatedEvent: Partial<LeaveEvent>) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, ...updatedEvent } : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    // Leave balance will be recalculated by the useEffect
  };

  const generateSuggestions = () => {
    const suggestedEvents: LeaveEvent[] = [
      {
        id: 'suggestion-1',
        title: 'Summer Vacation',
        startDate: new Date(currentDate.getFullYear(), 6, 15),
        endDate: new Date(currentDate.getFullYear(), 6, 25),
        type: EventType.SUGGESTED_LEAVE,
        description: 'Good time for vacation - low workload expected'
      },
      {
        id: 'suggestion-2',
        title: 'Winter Break',
        startDate: new Date(currentDate.getFullYear(), 11, 20),
        endDate: new Date(currentDate.getFullYear(), 11, 31),
        type: EventType.SUGGESTED_LEAVE,
        description: 'End of year break - office will be quiet'
      }
    ];
    
    setSuggestedLeave(suggestedEvents);
  };

  const setDateRange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const eraseEventsInRange = (startDate: Date, endDate: Date): LeaveEvent[] => {
    // Normalize dates to start of day
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Find all events that overlap with the range
    const eventsToErase = events.filter(event => 
      doDatesOverlap(event.startDate, event.endDate, start, end)
    );

    // Create a new array without the events to erase
    const remainingEvents = events.filter(event => 
      !eventsToErase.some(e => e.id === event.id)
    );

    // Update the events state
    setEvents(remainingEvents);

    return eventsToErase;
  };

  return (
    <LeaveContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      eraseEventsInRange,
      leaveBalance,
      setLeaveBalance,
      isCreatingEvent,
      setIsCreatingEvent,
      calendarView,
      setCalendarView,
      currentDate,
      setCurrentDate,
      suggestedLeave,
      generateSuggestions,
      activeEventId,
      setActiveEventId,
      startDate,
      endDate,
      setDateRange
    }}>
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};