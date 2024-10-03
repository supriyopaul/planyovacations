from fastapi import FastAPI
from datetime import date, timedelta
from models import Day
import holidays

'''
class Day(BaseModel):
    date: date
    is_weekend: bool = False
    is_public_holiday: bool = False
    public_holiday_name: str = ""
    is_planned_leave: bool = False
    is_half_day_leave: bool = False
    is_preferred_period: bool = False
    is_unpreferred_period: bool = False
    is_suggested_leave: bool = False
    is_locked_leave: bool = False
    is_rejected_suggestion: bool = False
    leave_reason: str = ""
    is_suggested_holiday: bool = False
'''

app = FastAPI()

@app.get("/calendar")
def get_calendar(start_date: date = None, work_week: int = 5, holiday_country: str = 'india'):
    if start_date is None:
        start_date = date.today()
    days = []

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
        # Default to India holidays if country not supported
        country_holidays = holidays.IN()
    
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
        
        # Check if public holiday
        if current_date in country_holidays:
            day.is_suggested_holiday = True
            day.public_holiday_name = country_holidays.get(current_date)
        
        days.append(day)

    return days
