export interface CalendarDay {
  date: string;
  is_weekend: boolean;
  is_public_holiday: boolean;
  public_holiday_name: string;
  is_planned_leave: boolean;
  is_preferred_leave_period: boolean;
  is_unpreferred_leave_period: boolean;
  leave_reason: string;
  is_recommended_leave: boolean;
}

export interface CalendarResponse {
  leave_balance: number;
  days: CalendarDay[];
}