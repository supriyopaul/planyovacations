export type EventType = 'holiday' | 'optional-holiday' | 'leave' | 'busy' | 'slow' | 'suggested';

export interface Event {
  id: string;
  type: EventType;
  startDate: string;
  endDate: string;
  title: string;
  description?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export interface CalendarDay {
  date: string;
  isWeekend: boolean;
  isHoliday: boolean;
  isOptionalHoliday: boolean;
  events: Event[];
}

export interface LeaveBalance {
  total: number;
  used: number;
  planned: number;
  remaining: number;
}

export interface CalendarSettings {
  workWeek: number;
  startDate: string;
  country: string;
  leaveBalance: LeaveBalance;
}

export interface SuggestionPreferences {
  preferredDuration: number;
  preferredMonths: string[];
  avoidBusyPeriods: boolean;
  maximizeLongWeekends: boolean;
  minDaysBetweenLeaves: number;
}

export interface CalendarState {
  days: CalendarDay[];
  settings: CalendarSettings;
  suggestions: Event[];
  preferences: SuggestionPreferences;
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
  sidebarExpanded: boolean;
  quickActionsExpanded: boolean;
  activeModal: string | null;
  selectedDate: string | null;
  selectedEvent: Event | null;
} 