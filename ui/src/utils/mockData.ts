import { LeaveEvent, EventType, LeaveBalance } from '../types';

export const generateMockData = () => {
  const currentYear = new Date().getFullYear();
  
  const events: LeaveEvent[] = [
    // Holidays
    {
      id: '1',
      title: 'New Year\'s Day',
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 0, 1),
      type: EventType.HOLIDAY
    },
    {
      id: '2',
      title: 'Memorial Day',
      startDate: new Date(currentYear, 4, 25),
      endDate: new Date(currentYear, 4, 25),
      type: EventType.HOLIDAY
    },
    {
      id: '3',
      title: 'Independence Day',
      startDate: new Date(currentYear, 6, 4),
      endDate: new Date(currentYear, 6, 4),
      type: EventType.HOLIDAY
    },
    {
      id: '4',
      title: 'Labor Day',
      startDate: new Date(currentYear, 8, 6),
      endDate: new Date(currentYear, 8, 6),
      type: EventType.HOLIDAY
    },
    {
      id: '5',
      title: 'Thanksgiving',
      startDate: new Date(currentYear, 10, 24),
      endDate: new Date(currentYear, 10, 24),
      type: EventType.HOLIDAY
    },
    {
      id: '6',
      title: 'Christmas',
      startDate: new Date(currentYear, 11, 25),
      endDate: new Date(currentYear, 11, 25),
      type: EventType.HOLIDAY
    },
    
    // Optional Holidays
    {
      id: '7',
      title: 'Martin Luther King Jr. Day',
      startDate: new Date(currentYear, 0, 15),
      endDate: new Date(currentYear, 0, 15),
      type: EventType.OPTIONAL_HOLIDAY
    },
    {
      id: '8',
      title: 'Presidents\' Day',
      startDate: new Date(currentYear, 1, 19),
      endDate: new Date(currentYear, 1, 19),
      type: EventType.OPTIONAL_HOLIDAY
    },
    
    // Planned Leave
    {
      id: '9',
      title: 'Spring Break',
      description: 'Family vacation',
      startDate: new Date(currentYear, 3, 10),
      endDate: new Date(currentYear, 3, 14),
      type: EventType.PLANNED_LEAVE
    },
    {
      id: '10',
      title: 'Summer Vacation',
      description: 'Beach trip',
      startDate: new Date(currentYear, 7, 5),
      endDate: new Date(currentYear, 7, 12),
      type: EventType.PLANNED_LEAVE
    },
    
    // Busy Periods
    {
      id: '11',
      title: 'Q1 Close',
      description: 'End of quarter financial reporting',
      startDate: new Date(currentYear, 2, 25),
      endDate: new Date(currentYear, 2, 31),
      type: EventType.BUSY_PERIOD
    },
    {
      id: '12',
      title: 'Product Launch',
      description: 'All hands on deck for major release',
      startDate: new Date(currentYear, 5, 15),
      endDate: new Date(currentYear, 5, 25),
      type: EventType.BUSY_PERIOD
    },
    
    // Slow Periods
    {
      id: '13',
      title: 'Summer Slowdown',
      description: 'Good time for vacation',
      startDate: new Date(currentYear, 6, 15),
      endDate: new Date(currentYear, 6, 31),
      type: EventType.SLOW_PERIOD
    },
    {
      id: '14',
      title: 'Holiday Lull',
      description: 'Reduced workload expected',
      startDate: new Date(currentYear, 11, 15),
      endDate: new Date(currentYear, 11, 31),
      type: EventType.SLOW_PERIOD
    }
  ];
  
  const leaveBalance: LeaveBalance = {
    total: 25,
    used: 5,
    planned: 8,
    remaining: 12
  };
  
  return { events, leaveBalance };
};