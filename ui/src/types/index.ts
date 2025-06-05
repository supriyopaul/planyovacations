export enum EventType {
  HOLIDAY = 'holiday',
  OPTIONAL_HOLIDAY = 'optional_holiday',
  PLANNED_LEAVE = 'planned_leave',
  BUSY_PERIOD = 'busy_period',
  SLOW_PERIOD = 'slow_period',
  SUGGESTED_LEAVE = 'suggested_leave',
  ERASER = 'eraser'
}

export interface LeaveEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: EventType;
}

export interface LeaveBalance {
  total: number;
  used: number;
  planned: number;
  remaining: number;
}

export type CalendarView = 'year' | 'week' | 'month';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
  events: LeaveEvent[];
  weekNumber?: number;
}

export interface DayProps {
  day: CalendarDay;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export interface CalendarGridProps {
  currentDate: Date;
  view: CalendarView;
  startDate?: Date | null;
  endDate?: Date | null;
  offDays?: number[];
  selectedBrush?: EventType | null;
  setSelectedBrush?: (brush: EventType | null) => void;
}

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export interface QuickActionsPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export type LeaveStyle = 'short' | 'mixed' | 'long';

export interface LeaveStylePreferences {
  style: LeaveStyle;
}

export interface CalendarExportData {
  events: LeaveEvent[];
  leaveBalance: LeaveBalance;
  calendarView: CalendarView;
  currentDate: string; // ISO string
  startDate: string | null; // ISO string
  endDate: string | null; // ISO string
  offDays: number[];
  version: string; // For future compatibility
  leaveStylePreferences?: LeaveStylePreferences; // Optional for backward compatibility
}