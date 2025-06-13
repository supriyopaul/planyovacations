# Planyovacations User Guide

## Overview

Planyovacations is an interactive calendar app designed to help you plan your leaves, vacations, and work periods with clarity and ease. The app provides intuitive tools in the sidebar for marking different types of events, visualizing your leave balance, and optimizing your time off based on work cycles and holidays.

---

## What You Can Do

- **Mark days or ranges** as Public Holidays, Optional Holidays, Planned Leave, Busy Periods, or Slow Periods using the sidebar brushes.
- **Erase events** by selecting the eraser tool and dragging over a range.
- **Extend or merge events** by dragging over multiple days with the same brush.
- **Manage your leave balance**: See how much leave you have planned and remaining.
- **Visualize overlaps and exclusivity**: The app enforces rules so only one event from each mutually exclusive group can exist per day.
- **Get leave suggestions** (if enabled) based on your preferences and work cycles.

---

## Sidebar Tools (Top Down)

- **Date Range Selectors**: Set the visible calendar range.
- **Weekend Marker**: Choose which days are considered weekends/off-days.
- **Leave Balance**: View and edit your total leave days. Planned leave is automatically calculated.
- **Marking Brushes**:
  - **Public Holiday**: Mark official holidays (blue).
  - **Optional Holiday**: Mark user-selectable holidays (yellow).
  - **Planned Leave**: Mark your own planned time off (teal).
  - **Busy Period**: Mark high-workload periods (red).
  - **Slow Period**: Mark low-workload periods (orange).
  - **Eraser**: Remove events from selected days.
- **Leave Style Preferences**: (If enabled) Adjust your leave suggestion preferences.
- **Export/Import**: Download or upload your calendar data.

---

## Brush & Event Behaviors

### Marking Days

- Select a brush (event type) from the sidebar. Each brush has a unique color:
  - **Public Holiday**: Blue
  - **Optional Holiday**: Yellow
  - **Planned Leave**: Teal
  - **Busy Period**: Red
  - **Slow Period**: Orange
  - **Eraser**: Grey
- Click and drag over days to mark a range. For example, to mark a week as planned leave, select the **Planned Leave (Teal)** brush and drag from Monday to Friday.
- When you release, a modal appears asking for a **Title** (required). You must enter a title (e.g., "Family Vacation", "Project Deadline").
- The title helps you identify and manage events, especially when merging or editing.

#### Example: Marking and Merging

- If you mark Mar 1–3 as **Planned Leave** (Teal) with the title "Trip to Goa", and later mark Mar 2–5 as **Planned Leave** (Teal) with the title "Family Time", the app will merge these into a single event (Mar 1–5). The modal will prompt you to enter a new title for the merged event.

### Extending & Merging Events

- Dragging over a range with the same brush merges overlapping events of that type into one continuous event.
- If you mark over an existing event of a different, mutually exclusive type (see table below), a **conversion modal** appears. This modal lets you choose which event type to keep (e.g., convert an Optional Holiday to Planned Leave, or vice versa).
- The modal will show all overlapping events and let you select the new type and enter a required title.

#### Example: Converting Mutually Exclusive Events

- If Mar 10 is marked as **Public Holiday** (Blue) and you try to mark it as **Planned Leave** (Teal), the modal will prompt you to convert the day. You can choose to keep it as a Public Holiday, convert it to Planned Leave (with a new title), or cancel.

### Eraser Behavior

- Select the **Eraser** (Grey) tool, then drag over days to select a range.
- A confirmation modal will show all events to be erased in that range, with their colors and titles.
- Erasing planned leave will update your leave balance accordingly.

---

## Leave Style Preferences

- The **Leave Style Preferences** slider in the sidebar lets you set your preferred leave pattern for AI-generated suggestions (if enabled).
- The slider has three values:
  - **Short breaks**: Prefer frequent, short leaves (e.g., long weekends).
  - **Mixed durations**: A balance of short and long leaves.
  - **Long vacations**: Prefer fewer, longer leaves (e.g., 1–2 week vacations).
- Adjusting this slider influences the suggestions shown in the sidebar, helping you optimize your time off based on your style.

---

## Leave Balance

- **Total**: Editable in the sidebar; represents your annual leave allowance.
- **Planned**: Automatically calculated from all planned leave events (business days only, excluding weekends/off-days).
- **Remaining**: Total minus planned.
- **Used**: (If tracked) Days already taken.
- **Erasing planned leave**: Reduces your planned leave count and increases remaining leave.

---

## Event Visualization

### Colored Lines

- Events are displayed as colored lines at the bottom of each calendar day.
- Each event type has a distinct color:
  - **Public Holiday**: Blue line
  - **Optional Holiday**: Yellow line
  - **Planned Leave**: Teal line
  - **Busy Period**: Red line
  - **Slow Period**: Orange line
  - **Suggested Leave**: Amber line
- Multiple events of the same type on the same day are shown as a single line.
- Different event types on the same day are shown as separate lines.
- Lines extend continuously across date ranges, with rounded corners at the start and end of ranges.
- Hover over any line to see a tooltip with the event title(s).

### Overlapping Events

- Only one event from each mutually exclusive group can exist per day:
  - **Public Holiday, Optional Holiday, Planned Leave** are mutually exclusive.
  - **Busy Period, Slow Period** are mutually exclusive.
- Marking a new event over an existing, mutually exclusive event will prompt you to convert or replace it.
- Multiple non-exclusive events (e.g., Planned Leave + Busy Period) can coexist on the same day.
- Overlapping events are visually indicated with multiple colored lines; hover to see details.

---

## Event Types, Exclusivity, and Colors

| Event Type       | Color (Line) | Mutually Exclusive With         | Affects Leave Balance | Description                   |
| ---------------- | ------------ | ------------------------------- | --------------------- | ----------------------------- |
| Public Holiday   | Blue         | Optional Holiday, Planned Leave | No                    | Non-working day, set by admin |
| Optional Holiday | Yellow       | Public Holiday, Planned Leave   | No                    | User-selectable holiday       |
| Planned Leave    | Teal         | Public/Optional Holiday         | Yes                   | User's planned time off       |
| Busy Period      | Red          | Slow Period                     | No                    | High workload, avoid leave    |
| Slow Period      | Orange       | Busy Period                     | No                    | Low workload, good for leave  |
| Suggested Leave  | Amber        | (N/A, suggestion only)          | No                    | AI-generated leave suggestion |

---

## Expected Behaviors & Best Practices

- **Use the correct brush** for the event you want to mark.
- **Extend events** by dragging over additional days with the same brush.
- **Erase carefully**: Erasing planned leave will affect your balance.
- **Check for overlaps**: The app will prompt you if you try to mark over a mutually exclusive event.
- **Review your leave balance** after making changes.
- **Export your calendar** regularly for backup.
- **Hover over lines** to see event details and titles.
