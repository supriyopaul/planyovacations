from datetime import datetime
import requests
import calendar
from colorama import init, Fore, Back, Style

# Initialize colorama
init(autoreset=True)

################################################### Prepare calendar
API_URL = 'http://127.0.0.1:8000/calendar?work_week=5&start_date=2024-02-01'
API_HOLIDAYS_URL = 'http://127.0.0.1:8000/calendar/holidays'
API_PLANNED_LEAVE_URL = 'http://127.0.0.1:8000/calendar/leave'

holidays_list = [
    {"date": "2024-01-01", "public_holiday_name": "New Year"},
    {"date": "2024-01-15", "public_holiday_name": "Makara Sankranti"},
    {"date": "2024-01-26", "public_holiday_name": "Republic Day"},
    {"date": "2024-03-29", "public_holiday_name": "Good Friday"},
    {"date": "2024-04-11", "public_holiday_name": "Ramzan"},
    {"date": "2024-05-01", "public_holiday_name": "May Day"},
    {"date": "2024-08-15", "public_holiday_name": "Independence Day"},
    {"date": "2024-10-02", "public_holiday_name": "Gandhi Jayanti"},
    {"date": "2024-10-11", "public_holiday_name": "Ayudh Puja/Mahanavami"},
    {"date": "2024-10-31", "public_holiday_name": "Naraka Chaturdasi"},
    {"date": "2024-11-01", "public_holiday_name": "Kannada Rajyotsava"},
    {"date": "2024-12-25", "public_holiday_name": "Christmas"},
    {"date": "2025-01-01", "public_holiday_name": "New Year"},
    {"date": "2025-01-15", "public_holiday_name": "Makara Sankranti"},
    {"date": "2025-01-26", "public_holiday_name": "Republic Day"}
]

try:
    response = requests.get(API_URL)
    response.raise_for_status()
    calendar_data = response.json()
except requests.exceptions.RequestException as e:
    print(f"Error fetching data from API: {e}")
    exit(1)

try:
    holidays_response = requests.post(API_HOLIDAYS_URL, json={
        "calendar": calendar_data,  # Assuming calendar_data is the existing calendar fetched earlier
        "holidays": holidays_list
    })
    holidays_response.raise_for_status()
    print("Holidays added successfully!")
    calendar_data = holidays_response.json()
except requests.exceptions.RequestException as e:
    print(f"Error adding holidays to the calendar: {e}")

planned_leave_data = {
    "calendar": calendar_data,  # Updated calendar with holidays
    "from_date": "2024-11-25",  # Ensure these dates are properly formatted as ISO strings
    "to_date": "2024-12-08",
    "leave_reason": "Vacation"
}

try:
    planned_leave_response = requests.post(API_PLANNED_LEAVE_URL, json=planned_leave_data)
    planned_leave_response.raise_for_status()
    print("Planned leave added successfully!")
    calendar_data = planned_leave_response.json()
except requests.exceptions.RequestException as e:
    print(f"Error adding planned leave to the calendar: {e}")
    exit(1)

# December 2024 as Preferred Leave Period
december_preferred = {
    "calendar": calendar_data,
    "from_date": "2024-12-01",
    "to_date": "2024-12-31",
    "leave_reason": "Preferred leave period for December 2024"
}

# January 2025 as Preferred Leave Period
january_preferred = {
    "calendar": calendar_data,
    "from_date": "2025-01-01",
    "to_date": "2025-01-31",
    "leave_reason": "Preferred leave period for January 2025"
}

try:
    # Mark December 2024 as preferred
    response_december = requests.post(API_PREFERRED_URL, json=december_preferred)
    response_december.raise_for_status()
    print("December 2024 marked as preferred leave period.")

    # Mark January 2025 as preferred
    response_january = requests.post(API_PREFERRED_URL, json=january_preferred)
    response_january.raise_for_status()
    print("January 2025 marked as preferred leave period.")

except requests.exceptions.RequestException as e:
    print(f"Error: {e}")

######################################################################## Visualize calendar
# Create a dictionary with dates as keys and properties as values
date_properties = {}
for day in calendar_data:
    date_str = day['date']
    date_properties[date_str] = day

# Define colors for different day properties
colors = {
    'is_weekend': Back.LIGHTYELLOW_EX + Fore.BLACK,          # Weekend - Softer yellow
    'is_public_holiday': Back.LIGHTRED_EX + Fore.WHITE,      # Public Holiday - Light red for better contrast
    'is_planned_leave': Back.LIGHTGREEN_EX + Fore.BLACK,     # Planned Leave - Light green for planned leave
    'is_half_day_leave': Back.LIGHTCYAN_EX + Fore.BLACK,     # Half-Day Leave - Light cyan
    'is_preferred_leave_period': Back.LIGHTBLUE_EX + Fore.BLACK,   # Preferred Period - Lighter blue for better readability
    'is_unpreferred_leave_period': Back.LIGHTMAGENTA_EX + Fore.BLACK, # Unpreferred Period - Light magenta
    'is_suggested_leave': Back.LIGHTWHITE_EX + Fore.BLACK,   # Suggested Leave - Soft white for suggestion
    'is_locked_leave': Back.BLUE + Fore.WHITE,               # Locked Leave - Use BLUE instead of DARKBLUE
    'is_rejected_suggestion': Back.RED + Fore.WHITE,         # Rejected Suggestion - Red for rejection
    'is_suggested_holiday': Back.LIGHTGREEN_EX + Fore.BLACK, # Public Suggested Holiday - Same as planned leave
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
