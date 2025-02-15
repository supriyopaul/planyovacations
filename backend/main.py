from datetime import date, timedelta
from typing import List
import holidays


import pycountry
from pydantic import ValidationError
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    Day,
    Calendar,
    PlannedLeaveRequest,
    CountryHolidayRequest,
    AddPublicHolidaysRequest,
    DeletePublicHolidayRequest,
)



EXTENDED_LEAVE_REASON = "Extended Leave"
CALENDAR_RANGE = 365

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/calendar")
def get_calendar(
    start_date: date = None,
    work_week: int = 5,
    leave_balance: int = 20
):

    if work_week not in [4, 5, 6]:
        raise HTTPException(status_code=400, detail="Invalid work week. Choose 4, 5, or 6 days.")

    if start_date is None:
        start_date = date.today()
    days = []
    
    for i in range(CALENDAR_RANGE):
        current_date = start_date + timedelta(days=i)
        day = Day(date=current_date)
        
        # Determine if weekend
        if work_week == 4:
            # Weekends are Friday, Saturday and Sunday
            if current_date.weekday() >= 4:  # 4 = Friday, 5 = Saturday, 6 = Sunday
                day.is_weekend = True
        elif work_week == 5:
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


@app.get("/countries")
def get_supported_countries():
    """
    Returns a list of supported countries and their codes.
    """
    try:
        # Get the list of supported country codes from the 'holidays' library
        country_codes = holidays.list_supported_countries()
        
        supported_countries = []
        for code in sorted(country_codes):
            # Use pycountry to get the country name from the code
            country = pycountry.countries.get(alpha_2=code)
            if country:
                supported_countries.append({'name': country.name, 'code': code})
            else:
                # If pycountry doesn't have the country, use the code as the name
                supported_countries.append({'name': code, 'code': code})
        return supported_countries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/calendar/holiday/country")
def add_public_holidays_by_country(request: CountryHolidayRequest):
    calendar = request.calendar
    country_input = request.holiday_country.upper()

    # Try to get the country code from pycountry
    country = pycountry.countries.get(name=country_input)
    if not country:
        country = pycountry.countries.get(alpha_2=country_input)
    if not country:
        country = pycountry.countries.get(alpha_3=country_input)
    if not country:
        raise HTTPException(status_code=400, detail="Country not found.")

    country_code = country.alpha_2

    # Check if the country code is supported by the 'holidays' library
    supported_countries = holidays.list_supported_countries()
    if country_code not in supported_countries:
        raise HTTPException(status_code=400, detail="Country not supported for public holidays.")

    # Determine country holidays
    try:
        country_holidays = holidays.CountryHoliday(country_code)
    except (NotImplementedError, KeyError):
        raise HTTPException(status_code=400, detail="Error retrieving holidays for the country.")
    
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
    
@app.post("/calendar/holiday/delete")
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
                if leave_days_requested > calendar.leave_balance:
                    raise HTTPException(status_code=400, detail="Insufficient leave balance.")
                day.is_planned_leave = True
                day.leave_reason = request.leave_reason  # Add the optional leave reason if provided

    # Check if leave balance is sufficient
    if leave_days_requested > calendar.leave_balance:
        raise HTTPException(status_code=400, detail="Insufficient leave balance")

    # Deduct the leave days from the balance
    calendar.leave_balance -= leave_days_requested

    return calendar

@app.post("/calendar/leave/delete")
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

@app.post("/calendar/recommend_leaves")
def recommend_leaves(request: Calendar, clear: bool = True):
    calendar = request

    # If clear is True, restore leave balance by adding back any previously suggested (but not locked) days,
    # and clear the recommended leave flags.
    if clear:
        num_recommended = sum(1 for day in calendar.days if day.is_recommended_leave)
        calendar.leave_balance += num_recommended
        for day in calendar.days:
            day.is_recommended_leave = False

    candidates = []
    remaining_leave_balance = calendar.leave_balance  # Initialize remaining leave balance

    # Identify potential breaks
    for i in range(len(calendar.days)):
        day = calendar.days[i]
        if day.is_weekend or day.is_public_holiday or day.is_planned_leave:
            continue  # Skip non-working days
        # Check for potential breaks
        potential_break = find_potential_break(calendar, i)
        if potential_break:
            candidates.append(potential_break)
    
    # Calculate scores for candidates
    for candidate in candidates:
        candidate['score'] = candidate_score(candidate, calendar)
    
    # Rank candidates
    rank_candidates(candidates)
    
    # Select candidates within leave balance and deduct from the remaining balance
    for candidate in candidates:
        LD = candidate['leave_days_required']
        if LD <= remaining_leave_balance:
            # Mark suggested leaves
            for idx in candidate['leave_day_indices']:
                calendar.days[idx].is_recommended_leave = True
            remaining_leave_balance -= LD
        else:
            continue  # Skip if insufficient leave balance

    # Update the leave balance in the calendar to reflect the deducted suggested days
    calendar.leave_balance = remaining_leave_balance

    return calendar

def is_non_working_day(day):
    return (day.is_weekend or day.is_public_holiday or day.is_planned_leave or
            day.is_unpreferred_leave_period)

def is_workday(day):
    return not is_non_working_day(day)

def count_workdays(days):
    return sum(1 for day in days if is_workday(day))

def calculate_break_length(candidate):
    return (candidate['end_date'] - candidate['start_date']).days + 1

def calculate_ppf(candidate, calendar):
    preferred_days = 0
    for idx in candidate['leave_day_indices']:
        if calendar.days[idx].is_preferred_leave_period:
            preferred_days += 1
    LD = candidate['leave_days_required']
    if preferred_days == LD:
        return 1.2  # Entirely within preferred period
    elif preferred_days > 0:
        return 1.1  # Partially within preferred period
    else:
        return 1.0  # Not within preferred period
    
def calculate_upp(candidate, calendar):
    unpreferred_days = 0
    for idx in candidate['leave_day_indices']:
        if calendar.days[idx].is_unpreferred_leave_period:
            unpreferred_days += 1
    LD = candidate['leave_days_required']
    if unpreferred_days == LD:
        return 0.8  # Entirely within unpreferred period
    elif unpreferred_days > 0:
        return 0.9  # Partially within unpreferred period
    else:
        return 1.0  # Not within unpreferred period

def calculate_df(candidate, calendar):
    # Penalize if the candidate is close to other leaves
    for existing in calendar.days:
        if existing.is_planned_leave or existing.is_recommended_leave:
            days_between = abs((existing.date - candidate['start_date']).days)
            if days_between < 30:
                return 0.9  # Penalize close leaves
    return 1.0  # Neutral score if leaves are well-distributed

def find_potential_break(calendar, index):
    # Look ahead and behind to find adjacent non-working days
    start_index = index
    end_index = index
    while start_index > 0 and is_non_working_day(calendar.days[start_index - 1]):
        start_index -= 1
    while end_index < len(calendar.days) - 1 and is_non_working_day(calendar.days[end_index + 1]):
        end_index += 1
    # Identify required leave days within this range
    leave_days_required = count_workdays(calendar.days[start_index:end_index + 1])
    if leave_days_required == 0:
        return None
    break_length = (calendar.days[end_index].date - calendar.days[start_index].date).days + 1
    return {
        'start_date': calendar.days[start_index].date,
        'end_date': calendar.days[end_index].date,
        'leave_days_required': leave_days_required,
        'leave_day_indices': [i for i in range(start_index, end_index + 1) if is_workday(calendar.days[i])],
    }

def candidate_score(candidate, calendar):
    BL = calculate_break_length(candidate)
    LD = candidate['leave_days_required']
    PPF = calculate_ppf(candidate, calendar)
    UPP = calculate_upp(candidate, calendar)
    DF = calculate_df(candidate, calendar)
    return ((BL / LD) * PPF * UPP) + DF

def rank_candidates(candidates):
    candidates.sort(key=lambda x: x['score'], reverse=True)

@app.post("/calendar/lock_recommended_leave")
def lock_recommended_leave(calendar: Calendar, date_to_lock: date):
    for day in calendar.days:
        if day.date == date_to_lock:
            if day.is_recommended_leave:
                day.is_planned_leave = True
                day.leave_reason = EXTENDED_LEAVE_REASON
                day.is_recommended_leave = False
                calendar.leave_balance = calendar.leave_balance - 1
                updated_calendar = recommend_leaves(calendar)
                return updated_calendar
            else:
                raise HTTPException(status_code=400, detail="Date is not a suggested leave")
    raise HTTPException(status_code=404, detail="Date not found in calendar")

@app.post("/calendar/reject_recommended_leave")
def reject_recommended_leave(calendar: Calendar, date_to_reject: date):
    for day in calendar.days:
        if day.date == date_to_reject:
            if day.is_recommended_leave:
                day.is_unpreferred_leave_period = True
                day.is_recommended_leave = False
                updated_calendar = recommend_leaves(calendar)
                return updated_calendar
            else:
                raise HTTPException(status_code=400, detail="Date is not a suggested leave")
    raise HTTPException(status_code=404, detail="Date not found in calendar")

@app.post("/calendar/export/json")
def export_calendar_json(calendar: Calendar):
    return calendar.dict()

@app.post("/calendar/export/pdf")
def export_calendar_pdf(calendar: Calendar):
    # Implement PDF generation logic here
    # Return PDF file as response
    pass

@app.post("/calendar/export/suggested_leaves")
def export_suggested_leaves(calendar: Calendar):
    suggested_leaves = [
        {
            "date": day.date,
            "reason": day.leave_reason
        }
        for day in calendar.days if day.is_recommended_leave or day.leave_reason == EXTENDED_LEAVE_REASON
    ]
    # Return as CSV or JSON
    return suggested_leaves

@app.post("/calendar/import")
def import_calendar(calendar_data: dict):
    try:
        calendar = Calendar(**calendar_data)
        return calendar
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/calendar/preferred/delete")
def remove_preferred_leave_period(request: PlannedLeaveRequest):
    calendar = request.calendar

    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be later than to_date")

    for day in calendar.days:
        if request.from_date <= day.date <= request.to_date:
            if day.is_preferred_leave_period:
                day.is_preferred_leave_period = False

    return calendar

@app.post("/calendar/unpreferred/delete")
def remove_unpreferred_leave_period(request: PlannedLeaveRequest):
    calendar = request.calendar

    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be later than to_date")

    for day in calendar.days:
        if request.from_date <= day.date <= request.to_date:
            if day.is_unpreferred_leave_period:
                day.is_unpreferred_leave_period = False

    return calendar

@app.delete("/calendar/recommended")
def remove_recommended_leave(request: PlannedLeaveRequest):
    calendar = request.calendar

    if request.from_date > request.to_date:
        raise HTTPException(status_code=400, detail="from_date cannot be later than to_date")

    for day in calendar.days:
        if request.from_date <= day.date <= request.to_date:
            if day.is_recommended_leave:
                day.is_recommended_leave = False

    return calendar
