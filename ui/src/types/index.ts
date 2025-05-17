export enum EventType {
  HOLIDAY = 'holiday',
  OPTIONAL_HOLIDAY = 'optional_holiday',
  PLANNED_LEAVE = 'planned_leave',
  BUSY_PERIOD = 'busy_period',
  SLOW_PERIOD = 'slow_period',
  SUGGESTED_LEAVE = 'suggested_leave'
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

export type CalendarView = 'year' | 'week';

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
  startDate?: Date;
  endDate?: Date;
}

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export interface QuickActionsPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}