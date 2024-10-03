from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class Day(BaseModel):
    date: date
    is_weekend: bool = False
    is_public_holiday: bool = False
    public_holiday_name: str = ""
    is_planned_leave: bool = False
    is_half_day_leave: bool = False
    is_preferred_period: bool = False
    is_unpreferred_period: bool = False
    is_locked_leave: bool = False
    is_rejected_suggestion: bool = False
    leave_reason: str = ""
    is_suggested_holiday: bool = False

class PublicHolidayRequest(BaseModel):
    date: date
    public_holiday_name: Optional[str] = None

class PlannedLeaveRequest(BaseModel):
    calendar: List[Day]
    from_date: date
    to_date: date
    leave_reason: str = ""