from fastapi import FastAPI, HTTPException
from datetime import date, timedelta
from models import Day, PublicHolidayRequest, PlannedLeaveRequest
import holidays
from typing import List

'''
class Day(BaseModel):
    date: date
    is_weekend: bool = False
    is_public_holiday: bool = False
    public_holiday_name: str = ""
    is_planned_leave: bool = False
    is_half_day_leave: bool = False
    is_preferred_leave_period: bool = False
    is_unpreferred_leave_period: bool = False
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
'''

app = FastAPI()

@app.get("/calendar")
def get_calendar(start_date: date = None, work_week: int = 5):
    if start_date is None:
        start_date = date.today()
    days = []
    
    for i in range(365):
        current_date = start_date + timedelta(days=i)
        day = Day(date=current_date)
        
        # Determine if weekend
        if work_week == 5:
            # Weekends are Saturday and Sunday
            if current_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
                day.is_weekend = True
        elif work_week == 6:
            # Only Sunday is weekend
            if current_date.weekday() == 6:  # 6 = Sunday
                day.is_weekend = True
        else:
            # Assume 7-day work week (no weekends)
            pass
        
        days.append(day)

    return days

@app.post("/calendar/holiday/country")
def add_public_holidays_by_country(calendar: List[Day], holiday_country: str):
    # Map country name to country code
    country_code = holiday_country.upper()
    country_name_to_code = {
        'INDIA': 'IN',
        'UNITED STATES': 'US',
        'US': 'US',
        'UK': 'UK',
        'UNITED KINGDOM': 'UK',
        'CANADA': 'CA',
        # Add more mappings as needed
    }
    country_code = country_name_to_code.get(country_code, country_code)

    # Determine country holidays
    try:
        country_holidays = holidays.CountryHoliday(country_code)
    except (NotImplementedError, KeyError):
        raise HTTPException(status_code=400, detail="Country not supported")
    
    # Add public holidays to the calendar
    for day in calendar:
        if day.date in country_holidays:
            day.is_public_holiday = True
            day.public_holiday_name = country_holidays.get(day.date)

    return calendar

@app.post("/calendar/holidays")
def add_public_holiday(calendar: List[Day], holidays: List[PublicHolidayRequest]):
    # Find the day in the calendar matching the input holiday date
    for day in calendar:
        for holiday in holidays:
            if day.date == holiday.date:
                # Update the day with public holiday information
                day.is_public_holiday = True
                day.public_holiday_name = holiday.public_holiday_name or "Unnamed Holiday"

    return calendar
    
@app.delete("/calendar/holiday/{holiday_date}")
def delete_public_holiday(calendar: List[Day], holiday_date: date):
    # Find the day in the calendar matching the holiday date
    for day in calendar:
        if day.date == holiday_date:
            # Reset the holiday information
            if day.is_public_holiday:
                day.is_public_holiday = False
                day.public_holiday_name = ""
                return calendar
            else:
                raise HTTPException(status_code=400, detail="No public holiday on this date to delete")
    
    raise HTTPException(status_code=404, detail="Date not found in the calendar")

@app.post("/calendar/leave")
def add_planned_leave(request: PlannedLeaveRequest):
    # Validate that from_date is before or the same as to_date
    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be later than to_date")
    
    # Loop through the range of dates
    for day in request.calendar:
        if request.from_date <= day.date <= request.to_date:
            # Skip weekends and public holidays
            if not day.is_weekend and not day.is_public_holiday:
                day.is_planned_leave = True
                day.leave_reason = request.leave_reason  # Add the optional leave reason if provided
    
    return request.calendar

@app.delete("/calendar/leave")
def remove_planned_leave(request: PlannedLeaveRequest):
    # Validate that from_date is before or the same as to_date
    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be later than to_date")
    
    # Loop through the range of dates and remove the planned leave
    for day in request.calendar:
        if request.from_date <= day.date <= request.to_date:
            if day.is_planned_leave:
                day.is_planned_leave = False
                day.leave_reason = ""
    
    return request.calendar

@app.post("/calendar/preferred")
def add_preferred_leave_period(request: PlannedLeaveRequest):
    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be later than to_date")

    for day in request.calendar:
        if request.from_date <= day.date <= request.to_date:
            if not day.is_public_holiday and not day.is_weekend:
                day.is_preferred_leave_period = True
    
    return request.calendar

@app.post("/calendar/unpreferred")
def add_unpreferred_leave_period(request: PlannedLeaveRequest):
    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be later than to_date")

    for day in request.calendar:
        if request.from_date <= day.date <= request.to_date:
            if not day.is_public_holiday and not day.is_weekend:
                day.is_unpreferred_leave_period = True
    
    return request.calendar