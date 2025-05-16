import { create } from 'zustand';
import type { CalendarState, CalendarSettings, Event, CalendarDay, SuggestionPreferences } from '../types/domain';
import { generateCalendarDays } from '../utils/calendar';

interface CalendarStore extends CalendarState {
  // Actions
  setSettings: (settings: Partial<CalendarSettings>) => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  setSuggestions: (suggestions: Event[]) => void;
  setPreferences: (preferences: Partial<SuggestionPreferences>) => void;
  resetCalendar: () => void;
}

const initialSettings: CalendarSettings = {
  workWeek: 5,
  startDate: new Date().toISOString().split('T')[0],
  country: 'US',
  leaveBalance: {
    total: 20,
    used: 0,
    planned: 0,
    remaining: 20,
  },
};

const initialState: CalendarState = {
  days: generateCalendarDays(initialSettings),
  settings: initialSettings,
  suggestions: [],
  preferences: {
    preferredDuration: 5,
    preferredMonths: [],
    avoidBusyPeriods: true,
    maximizeLongWeekends: true,
    minDaysBetweenLeaves: 14,
  },
};

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  ...initialState,

  setSettings: (settings) => {
    const currentSettings = get().settings;
    const newSettings = { ...currentSettings, ...settings };
    const days = generateCalendarDays(newSettings);
    set({ settings: newSettings, days });
  },

  addEvent: (event) => {
    const days = get().days.map((day) => {
      if (day.date >= event.startDate && day.date <= event.endDate) {
        return {
          ...day,
          events: [...day.events, event],
        };
      }
      return day;
    });
    set({ days });
  },

  updateEvent: (eventId, updates) => {
    const days = get().days.map((day) => ({
      ...day,
      events: day.events.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      ),
    }));
    set({ days });
  },

  deleteEvent: (eventId) => {
    const days = get().days.map((day) => ({
      ...day,
      events: day.events.filter((event) => event.id !== eventId),
    }));
    set({ days });
  },

  setSuggestions: (suggestions) => set({ suggestions }),

  setPreferences: (preferences) => {
    const currentPreferences = get().preferences;
    set({
      preferences: { ...currentPreferences, ...preferences },
    });
  },

  resetCalendar: () => set(initialState),
})); 