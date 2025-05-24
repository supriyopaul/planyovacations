import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LeaveEvent, EventType, LeaveBalance, CalendarView } from '../types';
import { generateMockData } from '../utils/mockData';

interface LeaveContextType {
  events: LeaveEvent[];
  addEvent: (event: Omit<LeaveEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<LeaveEvent>) => void;
  deleteEvent: (id: string) => void;
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

// Helper function to check if two date ranges overlap
const doDatesOverlap = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  
  s1.setHours(0, 0, 0, 0);
  e1.setHours(0, 0, 0, 0);
  s2.setHours(0, 0, 0, 0);
  e2.setHours(0, 0, 0, 0);
  
  return s1 <= e2 && s2 <= e1;
};

// Helper function to get overlapping events
const getOverlappingEvents = (events: LeaveEvent[], startDate: Date, endDate: Date, type: EventType): LeaveEvent[] => {
  return events.filter(event => {
    // Only consider holiday types for mutual exclusivity
    if (event.type !== EventType.HOLIDAY && event.type !== EventType.OPTIONAL_HOLIDAY) {
      return false;
    }
    return doDatesOverlap(event.startDate, event.endDate, startDate, endDate);
  });
};

// Helper function to merge overlapping events of the same type
const mergeSameTypeEvents = (events: LeaveEvent[], newEvent: Omit<LeaveEvent, 'id'>, type: EventType): LeaveEvent[] => {
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

  // Remove all overlapping events
  const remainingEvents = events.filter(e => !overlappingEvents.includes(e));

  // Add the merged event with the new event's title
  return [...remainingEvents, {
    ...newEvent,
    id: Math.random().toString(36).substr(2, 9),
    startDate: mergedStart,
    endDate: mergedEnd
  }];
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

  // Remove all overlapping holiday events
  const remainingEvents = events.filter(e => !overlappingEvents.includes(e));

  // Add the new event
  return [...remainingEvents, { ...newEvent, id: Math.random().toString(36).substr(2, 9) }];
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

    // For holiday types, handle merging and conversion
    if (event.type === EventType.HOLIDAY || event.type === EventType.OPTIONAL_HOLIDAY) {
      // If there are any overlapping events of different holiday types, handle conversion
      const hasDifferentTypeOverlap = events.some(e => 
        (e.type === EventType.HOLIDAY || e.type === EventType.OPTIONAL_HOLIDAY) &&
        e.type !== event.type &&
        doDatesOverlap(e.startDate, e.endDate, start, end)
      );

      if (hasDifferentTypeOverlap) {
        setEvents(handleHolidayConversion(events, normalizedEvent));
      } else {
        // Merge with same type events
        setEvents(mergeSameTypeEvents(events, normalizedEvent, event.type));
      }
    } else {
      // For non-holiday types, add as normal
      const newEvent = {
        ...normalizedEvent,
        id: Math.random().toString(36).substr(2, 9)
      };
      setEvents([...events, newEvent]);
    }
    
    if (event.type === EventType.PLANNED_LEAVE) {
      updateLeaveBalance(event);
    }
  };

  const updateEvent = (id: string, updatedEvent: Partial<LeaveEvent>) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, ...updatedEvent } : event
    ));
  };

  const deleteEvent = (id: string) => {
    const eventToDelete = events.find(event => event.id === id);
    if (eventToDelete && eventToDelete.type === EventType.PLANNED_LEAVE) {
      const start = new Date(eventToDelete.startDate);
      const end = new Date(eventToDelete.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setLeaveBalance(prev => ({
        ...prev,
        planned: Math.max(0, prev.planned - diffDays),
        remaining: prev.remaining + diffDays
      }));
    }
    setEvents(events.filter(event => event.id !== id));
  };

  const updateLeaveBalance = (event: Omit<LeaveEvent, 'id'>) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    setLeaveBalance(prev => ({
      ...prev,
      planned: prev.planned + diffDays,
      remaining: prev.remaining - diffDays
    }));
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

  return (
    <LeaveContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
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