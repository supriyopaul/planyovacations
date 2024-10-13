from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class Day(BaseModel):
    date: date
    is_weekend: bool = False
    is_public_holiday: bool = False
    public_holiday_name: str = ""
    is_planned_leave: bool = False
    is_preferred_leave_period: bool = False
    is_unpreferred_leave_period: bool = False
    leave_reason: str = ""
    is_recommended_leave: bool = False

class Calendar(BaseModel):
    leave_balance: int
    days: List[Day]

class PublicHolidayRequest(BaseModel):
    date: date
    public_holiday_name: Optional[str] = None

class PlannedLeaveRequest(BaseModel):
    calendar: Calendar
    from_date: date
    to_date: date
    leave_reason: str = ""

class CountryHolidayRequest(BaseModel):
    calendar: Calendar
    holiday_country: str

class AddPublicHolidaysRequest(BaseModel):
    calendar: Calendar
    holidays: List[PublicHolidayRequest]

class DeletePublicHolidayRequest(BaseModel):
    calendar: Calendar
    holiday_date: date
