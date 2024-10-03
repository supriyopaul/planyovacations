import requests
import json
import calendar
from datetime import datetime, timedelta
from colorama import init, Fore, Back, Style

# Initialize colorama
init(autoreset=True)

API_URL = 'http://127.0.0.1:8000/calendar?work_week=5&holiday_country=india'

try:
    response = requests.get(API_URL)
    response.raise_for_status()
    calendar_data = response.json()
except requests.exceptions.RequestException as e:
    print(f"Error fetching data from API: {e}")
    exit(1)

# Create a dictionary with dates as keys and properties as values
date_properties = {}
for day in calendar_data:
    date_str = day['date']
    date_properties[date_str] = day

# Define colors for different day properties
colors = {
    'is_weekend': Back.YELLOW + Fore.BLACK,          # Weekend
    'is_public_holiday': Back.RED + Fore.WHITE,      # Public Holiday
    'is_planned_leave': Back.GREEN + Fore.BLACK,     # Planned Leave
    'is_half_day_leave': Back.CYAN + Fore.BLACK,     # Half-Day Leave
    'is_preferred_period': Back.BLUE + Fore.WHITE,   # Preferred Period
    'is_unpreferred_period': Back.MAGENTA + Fore.WHITE, # Unpreferred Period
    'is_suggested_leave': Back.WHITE + Fore.BLACK,   # Suggested Leave
    'is_locked_leave': Back.BLACK + Fore.WHITE,      # Locked Leave
    'is_rejected_suggestion': Back.LIGHTRED_EX + Fore.BLACK, # Rejected Suggestion
    'is_suggested_holiday': Back.LIGHTGREEN_EX + Fore.BLACK, # Public Suggested Holiday
}

# Determine the start date from the data
start_date = datetime.strptime(calendar_data[0]['date'], '%Y-%m-%d')
start_year = start_date.year
start_month = start_date.month

# Iterate over each month in the next 12 months
for month_offset in range(12):
    # Calculate the year and month
    year = start_year + ((start_month + month_offset - 1) // 12)
    month = ((start_month + month_offset - 1) % 12) + 1

    # Create a calendar month
    cal = calendar.monthcalendar(year, month)
    month_name = calendar.month_name[month]
    print(f"\n{month_name} {year}")
    print("Mo Tu We Th Fr Sa Su")

    # Iterate over each week in the month
    for week in cal:
        week_str = ''
        for day in week:
            if day == 0:
                week_str += '   '  # Empty day
            else:
                date_obj = datetime(year, month, day)
                date_str = date_obj.strftime('%Y-%m-%d')
                day_str = f"{day:2}"

                # Get the properties for this date
                day_props = date_properties.get(date_str, {})

                # Determine color to apply
                day_color = ''
                for prop, color in colors.items():
                    if day_props.get(prop):
                        day_color = color
                        break  # Use the first matching color

                if day_color:
                    day_str = day_color + day_str + Style.RESET_ALL
                else:
                    day_str = day_str  # No color applied

                week_str += day_str + ' '
        print(week_str)

# Print the legend
print("\nLegend:")
for prop, color in colors.items():
    # Remove underscores and capitalize words for readability
    prop_readable = prop.replace('_', ' ').title()
    print(f"{color}  {Style.RESET_ALL} - {prop_readable}")
