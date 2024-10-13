from fastapi import FastAPI, HTTPException
from datetime import date, timedelta
from models import (
    Day,
    Calendar,
    PlannedLeaveRequest,
    CountryHolidayRequest,
    AddPublicHolidaysRequest,
    DeletePublicHolidayRequest,
    PublicHolidayRequest,
)
import holidays

app = FastAPI()

@app.get("/calendar")
def get_calendar(
    start_date: date = None,
    work_week: int = 5,
    leave_balance: int = 20
):
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

    calendar = Calendar(leave_balance=leave_balance, days=days)
    return calendar

@app.post("/calendar/holiday/country")
def add_public_holidays_by_country(request: CountryHolidayRequest):
    calendar = request.calendar
    holiday_country = request.holiday_country

    # Map country name to country code
    country_name_to_code = {
        'INDIA': 'IN',
        'UNITED STATES': 'US',
        'US': 'US',
        'UK': 'UK',
        'UNITED KINGDOM': 'UK',
        'CANADA': 'CA',
        # Add more mappings as needed
    }
    country_code = country_name_to_code.get(holiday_country.upper())

    if not country_code:
        raise HTTPException(status_code=400, detail="Country not supported")

    # Determine country holidays
    try:
        country_holidays = holidays.CountryHoliday(country_code)
    except (NotImplementedError, KeyError):
        raise HTTPException(status_code=400, detail="Country not supported")
    
    # Add public holidays to the calendar
    for day in calendar.days:
        if day.date in country_holidays:
            day.is_public_holiday = True
            day.public_holiday_name = country_holidays.get(day.date)

    return calendar

@app.post("/calendar/holidays")
def add_public_holiday(request: AddPublicHolidaysRequest):
    calendar = request.calendar
    holidays_list = request.holidays

    # Find the day in the calendar matching the input holiday date
    for holiday in holidays_list:
        for day in calendar.days:
            if day.date == holiday.date:
                # Update the day with public holiday information
                day.is_public_holiday = True
                day.public_holiday_name = holiday.public_holiday_name or "Unnamed Holiday"
                break

    return calendar
    
@app.delete("/calendar/holiday")
def delete_public_holiday(request: DeletePublicHolidayRequest):
    calendar = request.calendar
    holiday_date = request.holiday_date

    # Find the day in the calendar matching the holiday date
    for day in calendar.days:
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
    calendar = request.calendar

    # Validate that from_date is before or the same as to_date
    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be later than to_date")

    # Calculate the number of leave days requested
    leave_days_requested = 0

    for day in calendar.days:
        if request.from_date <= day.date <= request.to_date:
            # Skip weekends and public holidays
            if not day.is_weekend and not day.is_public_holiday:
                if not day.is_planned_leave:
                    leave_days_requested += 1
                day.is_planned_leave = True
                day.leave_reason = request.leave_reason  # Add the optional leave reason if provided

    # Check if leave balance is sufficient
    if leave_days_requested > calendar.leave_balance:
        raise HTTPException(status_code=400, detail="Insufficient leave balance")

    # Deduct the leave days from the balance
    calendar.leave_balance -= leave_days_requested

    return calendar

@app.delete("/calendar/leave")
def remove_planned_leave(request: PlannedLeaveRequest):
    calendar = request.calendar

    # Validate that from_date is before or the same as to_date
    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be later than to_date")

    # Count the number of leave days being removed
    leave_days_removed = 0

    # Loop through the range of dates and remove the planned leave
    for day in calendar.days:
        if request.from_date <= day.date <= request.to_date:
            if day.is_planned_leave:
                day.is_planned_leave = False
                day.leave_reason = ""
                leave_days_removed += 1

    # Add the leave days back to the balance
    calendar.leave_balance += leave_days_removed

    return calendar

@app.post("/calendar/preferred")
def add_preferred_leave_period(request: PlannedLeaveRequest):
    calendar = request.calendar

    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be later than to_date")

    for day in calendar.days:
        if request.from_date <= day.date <= request.to_date:
            if not day.is_public_holiday and not day.is_weekend:
                day.is_preferred_leave_period = True

    return calendar

@app.post("/calendar/unpreferred")
def add_unpreferred_leave_period(request: PlannedLeaveRequest):
    calendar = request.calendar

    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be later than to_date")

    for day in calendar.days:
        if request.from_date <= day.date <= request.to_date:
            if not day.is_public_holiday and not day.is_weekend:
                day.is_unpreferred_leave_period = True

    return calendar