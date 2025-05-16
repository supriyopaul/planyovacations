import { create } from 'zustand';
import type { AppState } from '../types/domain';

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  error: null,
  sidebarExpanded: false,
  quickActionsExpanded: true,
  activeModal: null,
  selectedDate: null,
  selectedEvent: null,

  // Actions
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  toggleQuickActions: () => set((state) => ({ quickActionsExpanded: !state.quickActionsExpanded })),
  setActiveModal: (modal: string | null) => set({ activeModal: modal }),
  setSelectedDate: (date: string | null) => set({ selectedDate: date }),
  setSelectedEvent: (event: Event | null) => set({ selectedEvent: event }),
})); 