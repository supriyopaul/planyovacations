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
    const newEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setEvents([...events, newEvent]);
    
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