import json
from datetime import date, timedelta, datetime
import uuid

# --- Configuration & Constants ---
SUGGESTION_LIMIT = 5  # Max number of suggestions to provide
LEAVE_STYLE_SHORT_MAX_DAYS = 2
LEAVE_STYLE_LONG_MIN_DAYS = 3 # Minimum leave days to be considered for "long" style focus

# --- Helper Functions ---
def parse_date_from_iso(iso_str):
    """Parses YYYY-MM-DD from ISO string, ignoring time/timezone for simplicity."""
    if not iso_str: return None
    try:
        return date.fromisoformat(iso_str.split('T')[0])
    except ValueError:
        print(f"Warning: Could not parse date from ISO string: {iso_str}")
        return None

def date_to_iso_event_str(d_obj):
    """Converts date object back to simplified ISO string format for events (start of day UTC)."""
    return f"{d_obj.isoformat()}T00:00:00.000Z"

def generate_day_infos(start_date_cal, end_date_cal, events_data, off_days_indices):
    """Creates a dictionary of DayInfo objects for the calendar range."""
    day_infos = {}
    if not start_date_cal or not end_date_cal:
        return day_infos # Cannot proceed if calendar range is invalid

    current_d = start_date_cal
    while current_d <= end_date_cal:
        day_infos[current_d] = {
            "date": current_d,
            "is_weekend": current_d.weekday() in off_days_indices,
            "is_public_holiday": False, "holiday_title": None,
            "is_optional_holiday": False, "optional_holiday_title": None, # Optional holidays are treated as off if marked by user
            "is_planned_leave": False, "planned_leave_title": None,
            "is_busy_period": False,
            "is_slow_period": False,
            "is_workday": True,  # Will be updated
        }
        current_d += timedelta(days=1)

    for event in events_data:
        event_start = parse_date_from_iso(event.get("startDate"))
        event_end = parse_date_from_iso(event.get("endDate"))

        if not event_start or not event_end: # Skip if event dates are invalid
            continue

        current_d = event_start
        while current_d <= event_end:
            if current_d in day_infos:
                day_info = day_infos[current_d]
                event_type = event.get("type")
                event_title = event.get("title", "Untitled Event")
                if event_type == "holiday":
                    day_info["is_public_holiday"] = True
                    day_info["holiday_title"] = event_title
                elif event_type == "optional_holiday": # If it's in events, user has marked it.
                    day_info["is_optional_holiday"] = True
                    day_info["optional_holiday_title"] = event_title
                elif event_type == "planned_leave":
                    day_info["is_planned_leave"] = True
                    day_info["planned_leave_title"] = event_title
                elif event_type == "busy_period":
                    day_info["is_busy_period"] = True
                elif event_type == "slow_period":
                    day_info["is_slow_period"] = True
            current_d += timedelta(days=1)

    for d, info in day_infos.items():
        info["is_workday"] = not (info["is_weekend"] or \
                                  info["is_public_holiday"] or \
                                  info["is_optional_holiday"] or \
                                  info["is_planned_leave"])
    return day_infos

def get_contiguous_off_period_details(leave_block_dates, day_infos_map):
    """
    Calculates the total contiguous off period resulting from taking leave on leave_block_dates.
    """
    if not leave_block_dates:
        return None, None, 0

    min_leave_date = min(leave_block_dates)
    max_leave_date = max(leave_block_dates)

    # Determine the actual start of the vacation
    vacation_start = min_leave_date
    while vacation_start >= min(day_infos_map.keys()):
        day_info = day_infos_map.get(vacation_start)
        # A day is effectively "off" if it's part of the leave block, or already a non-workday
        is_effectively_off = (vacation_start in leave_block_dates) or \
                             (day_info and not day_info["is_workday"])
        if not is_effectively_off:
            vacation_start += timedelta(days=1) # The previous day was the last off day
            break
        if vacation_start == min(day_infos_map.keys()): # Reached beginning of calendar
            break
        vacation_start -= timedelta(days=1)
    else: # Loop didn't break naturally, means vacation_start went below calendar bounds
        vacation_start = min(day_infos_map.keys())


    # Determine the actual end of the vacation
    vacation_end = max_leave_date
    while vacation_end <= max(day_infos_map.keys()):
        day_info = day_infos_map.get(vacation_end)
        is_effectively_off = (vacation_end in leave_block_dates) or \
                             (day_info and not day_info["is_workday"])
        if not is_effectively_off:
            vacation_end -= timedelta(days=1) # The previous day was the last off day
            break
        if vacation_end == max(day_infos_map.keys()): # Reached end of calendar
            break
        vacation_end += timedelta(days=1)
    else: # Loop didn't break naturally
        vacation_end = max(day_infos_map.keys())

    if vacation_start > vacation_end: # Safety check
        return min_leave_date, max_leave_date, len(leave_block_dates)

    total_days_off = (vacation_end - vacation_start).days + 1
    return vacation_start, vacation_end, total_days_off

# --- Main Algorithm Functions ---
def generate_leave_suggestions(data):
    """Generates leave suggestions and reports based on input calendar data."""
    calendar_start_date = parse_date_from_iso(data.get("startDate"))
    calendar_end_date = parse_date_from_iso(data.get("endDate"))
    
    if not calendar_start_date or not calendar_end_date or calendar_start_date > calendar_end_date:
        print("Error: Invalid calendar start or end date.")
        data["suggestions_report"] = {"summary": "Error: Invalid calendar date range.", "details": []}
        return data

    off_days = data.get("offDays", [6, 0]) # Default Sat, Sun
    leave_balance_remaining = data.get("leaveBalance", {}).get("remaining", 0)
    leave_style = data.get("leaveStylePreferences", {}).get("style", "mixed")

    day_infos = generate_day_infos(calendar_start_date, calendar_end_date, data.get("events", []), off_days)
    if not day_infos:
        data["suggestions_report"] = {"summary": "Error: Could not process day information.", "details": []}
        return data
        
    potential_suggestions = []
    sorted_calendar_dates = sorted(day_infos.keys())

    # Iterate through possible start dates for leave
    for i, potential_leave_start_date in enumerate(sorted_calendar_dates):
        # Max number of *consecutive calendar days* to check for forming a leave block
        # The actual number of *workdays* taken as leave will be filtered later.
        max_calendar_days_in_block = 1
        if leave_style == "short":
            max_calendar_days_in_block = 5 # e.g., Fri + Mon (weekend in between) could be 4 calendar days for 2 leave days
        elif leave_style == "long":
            max_calendar_days_in_block = 14 # Look for longer stretches
        elif leave_style == "mixed":
            max_calendar_days_in_block = 7

        # Iterate through possible end dates for the block being considered for leave
        for block_len_idx in range(max_calendar_days_in_block):
            if i + block_len_idx >= len(sorted_calendar_dates):
                break
            
            potential_leave_end_date = sorted_calendar_dates[i + block_len_idx]
            
            current_block_leave_days = [] # Actual workdays to take as leave in this block
            current_block_contains_busy = False
            
            # Evaluate days from potential_leave_start_date to potential_leave_end_date
            temp_eval_date = potential_leave_start_date
            while temp_eval_date <= potential_leave_end_date:
                day_info = day_infos.get(temp_eval_date)
                if not day_info: # Should not happen if sorted_calendar_dates is from day_infos keys
                    current_block_contains_busy = True; break 

                if day_info["is_busy_period"]:
                    current_block_contains_busy = True; break
                
                if day_info["is_workday"]: # Only actual workdays can be taken as leave
                    current_block_leave_days.append(temp_eval_date)
                temp_eval_date += timedelta(days=1)

            if current_block_contains_busy or not current_block_leave_days:
                continue # Skip if block has busy period or no workdays to take as leave
            
            num_actual_leave_days = len(current_block_leave_days)

            # Adhere to leave style for number of WORKDAYS taken
            if leave_style == "short" and num_actual_leave_days > LEAVE_STYLE_SHORT_MAX_DAYS:
                continue
            if leave_style == "long" and num_actual_leave_days < LEAVE_STYLE_LONG_MIN_DAYS:
                continue
            if num_actual_leave_days == 0 or num_actual_leave_days > leave_balance_remaining:
                continue

            vacation_s, vacation_e, total_off = get_contiguous_off_period_details(
                current_block_leave_days, day_infos
            )
            
            if total_off <= num_actual_leave_days : # No benefit or only taking leave on already off days (should be filtered by is_workday)
                continue

            efficiency = total_off / num_actual_leave_days if num_actual_leave_days > 0 else 0
            
            reason_parts = []
            # Check adjacency of the *entire vacation period*
            day_before_vacation_s = day_infos.get(vacation_s - timedelta(days=1))
            if day_before_vacation_s:
                if day_before_vacation_s["is_public_holiday"]: reason_parts.append(f"Extends PH '{day_before_vacation_s['holiday_title']}'")
                elif day_before_vacation_s["is_optional_holiday"]: reason_parts.append(f"Extends OptH '{day_before_vacation_s['optional_holiday_title']}'")
                elif day_before_vacation_s["is_planned_leave"]: reason_parts.append(f"Extends PL '{day_before_vacation_s['planned_leave_title']}'")
                elif day_before_vacation_s["is_weekend"]: reason_parts.append("Starts after weekend")

            day_after_vacation_e = day_infos.get(vacation_e + timedelta(days=1))
            if day_after_vacation_e:
                if day_after_vacation_e["is_public_holiday"]: reason_parts.append(f"Connects to PH '{day_after_vacation_e['holiday_title']}'")
                elif day_after_vacation_e["is_optional_holiday"]: reason_parts.append(f"Connects to OptH '{day_after_vacation_e['optional_holiday_title']}'")
                elif day_after_vacation_e["is_planned_leave"]: reason_parts.append(f"Connects to PL '{day_after_vacation_e['planned_leave_title']}'")
                elif day_after_vacation_e["is_weekend"]: reason_parts.append("Ends before weekend")
            
            is_in_slow_period = any(day_infos[d]["is_slow_period"] for d in current_block_leave_days if d in day_infos)
            if is_in_slow_period:
                reason_parts.append("Utilizes slow period.")
                efficiency *= 1.1 # Bonus

            if not reason_parts: reason_parts.append("General break.")
            
            # Ensure no duplicate reasons if generated by multiple conditions
            final_reason = "; ".join(list(dict.fromkeys(reason_parts)))


            suggestion = {
                "reason": final_reason,
                "leave_days_to_take_iso": sorted([d.isoformat() for d in current_block_leave_days]),
                "leave_days_count": num_actual_leave_days,
                "vacation_period": {"start": vacation_s.isoformat(), "end": vacation_e.isoformat()},
                "total_vacation_days": total_off,
                "efficiency_score": efficiency,
                "_leave_dates_obj_set": frozenset(current_block_leave_days) # For quick duplicate check
            }
            potential_suggestions.append(suggestion)

    # Deduplicate suggestions that result in the same set of leave days
    unique_suggestions = []
    seen_leave_sets = set()
    for sug in sorted(potential_suggestions, key=lambda s: s["efficiency_score"], reverse=True): # Pre-sort for better selection
        if sug["_leave_dates_obj_set"] not in seen_leave_sets:
            unique_suggestions.append(sug)
            seen_leave_sets.add(sug["_leave_dates_obj_set"])
    
    # Sort unique suggestions: highest efficiency, then longest vacation, then fewest leave days.
    unique_suggestions.sort(key=lambda s: (s["efficiency_score"], s["total_vacation_days"], -s["leave_days_count"]), reverse=True)
    
    final_suggestions_report_details = []
    final_suggested_events = []
    suggested_leave_days_globally_taken = set() # To prevent overlap in top N
    rank = 1

    for sug in unique_suggestions:
        if len(final_suggestions_report_details) >= SUGGESTION_LIMIT:
            break

        current_suggestion_leave_dates = sug["_leave_dates_obj_set"]
        if any(d in suggested_leave_days_globally_taken for d in current_suggestion_leave_dates):
            continue # Overlaps with an already selected higher-ranked suggestion
            
        for d in current_suggestion_leave_dates:
            suggested_leave_days_globally_taken.add(d)

        report_item = {
            "rank": rank,
            "reason": sug["reason"],
            "leave_days_to_take": sug["leave_days_to_take_iso"],
            "leave_days_count": sug["leave_days_count"],
            "vacation_period": sug["vacation_period"],
            "total_vacation_days": sug["total_vacation_days"],
            "efficiency_report": f"{sug['total_vacation_days']} days off for {sug['leave_days_count']} leave day(s) (Score: {sug['efficiency_score']:.2f})"
        }
        final_suggestions_report_details.append(report_item)
        
        suggestion_event_title = f"Suggested Leave (Rank {rank})"
        # For a block of leave days, create one event
        event_start_date = min(current_suggestion_leave_dates)
        event_end_date = max(current_suggestion_leave_dates)

        final_suggested_events.append({
            "title": suggestion_event_title,
            "type": "suggested_leave",
            "startDate": date_to_iso_event_str(event_start_date),
            "endDate": date_to_iso_event_str(event_end_date), # If single day, start and end will be same date
            "id": str(uuid.uuid4()),
            "suggestion_details_summary": sug["reason"] # Short summary for event
        })
        rank += 1

    total_sug_leave_days = sum(s['leave_days_count'] for s in final_suggestions_report_details)
    summary_msg = f"Generated {len(final_suggestions_report_details)} suggestions. Consider taking {total_sug_leave_days} leave day(s) based on these."
    if not final_suggestions_report_details:
        summary_msg = "No suitable leave suggestions found based on current criteria and remaining leave balance."

    data["suggestions_report"] = {
        "summary": summary_msg,
        "details": final_suggestions_report_details
    }
    if "events" not in data: data["events"] = []
    data["events"].extend(final_suggested_events)
    
    return data

# --- Main Execution ---
if __name__ == "__main__":
    input_json_str = """
{
  "events": [
    {"title": "New Year","type": "holiday","startDate": "2025-01-01T00:00:00.000Z","endDate": "2025-01-01T00:00:00.000Z","id": "ny25"},
    {"title": "Republic Day","type": "holiday","startDate": "2025-01-26T00:00:00.000Z","endDate": "2025-01-26T00:00:00.000Z","id": "rd25"},
    {"title": "May Day","type": "holiday","startDate": "2025-05-01T00:00:00.000Z","endDate": "2025-05-01T00:00:00.000Z","id": "md25"},
    {"title": "Independence Day","type": "holiday","startDate": "2025-08-15T00:00:00.000Z","endDate": "2025-08-15T00:00:00.000Z","id": "id25"},
    {"title": "Gandhi Jayanthi","type": "holiday","startDate": "2025-10-02T00:00:00.000Z","endDate": "2025-10-02T00:00:00.000Z","id": "gj25"},
    {"title": "Diwali Holiday","type": "holiday","startDate": "2025-10-21T00:00:00.000Z","endDate": "2025-10-21T00:00:00.000Z","id": "diwali25"},
    {"title": "Christmas","type": "holiday","startDate": "2025-12-25T00:00:00.000Z","endDate": "2025-12-25T00:00:00.000Z","id": "xmas25"},
    {"title": "My Birthday PL","type": "planned_leave","startDate": "2025-07-14T00:00:00.000Z","endDate": "2025-07-14T00:00:00.000Z","id": "bdaypl"},
    {"title": "Long Weekend Trip","type": "planned_leave","startDate": "2025-08-29T00:00:00.000Z","endDate": "2025-08-29T00:00:00.000Z","id": "lwaug"},
    {"title": "Year End Slowdown","type": "slow_period","startDate": "2025-12-22T00:00:00.000Z","endDate": "2025-12-31T00:00:00.000Z","id": "yeslow"},
    {"title": "Critical Project Phase","type": "busy_period","startDate": "2025-06-09T00:00:00.000Z","endDate": "2025-06-20T00:00:00.000Z","id": "busyjun"},
    {"title": "Optional Holiday Example","type": "optional_holiday","startDate": "2025-04-14T00:00:00.000Z","endDate": "2025-04-14T00:00:00.000Z","id": "optholapr"}
  ],
  "leaveBalance": {"total": 20, "used": 0, "planned": 2, "remaining": 18 },
  "calendarView": "year",
  "currentDate": "2025-06-05T08:59:25.000Z",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-12-31T00:00:00.000Z",
  "offDays": [5, 6], 
  "version": "1.0.1",
  "leaveStylePreferences": {"style": "mixed"}
}
    """
    # Corrected offDays to [5,6] for Sat, Sun to match typical weekend.
    # Adjusted some holiday dates to be more standard for testing.
    input_data = json.loads(input_json_str)
    output_data = generate_leave_suggestions(input_data.copy())
    
    print("\n### Output JSON with Suggestions ###")
    print(json.dumps(output_data, indent=2))

    print("\n\n### Suggestions Report (Console) ###")
    if "suggestions_report" in output_data and output_data["suggestions_report"]:
        print(output_data["suggestions_report"]["summary"])
        for detail in output_data["suggestions_report"]["details"]:
            print(f"\n  Rank {detail['rank']}:")
            print(f"    Reason: {detail['reason']}")
            print(f"    Take Leave On: {', '.join(detail['leave_days_to_take'])} ({detail['leave_days_count']} day(s))")
            print(f"    Total Vacation: {detail['vacation_period']['start']} to {detail['vacation_period']['end']} ({detail['total_vacation_days']} days)")
            print(f"    Efficiency: {detail['efficiency_report']}")
    else:
        print("No suggestions report generated or report is empty.")