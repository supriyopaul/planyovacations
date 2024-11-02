import type { CalendarResponse } from '../types';

export async function fetchCalendarData(
  workWeek: number,
  startDate: string,
  leaveBalance: number
): Promise<CalendarResponse> {
  const url = new URL('https://jj21glhf-8000.inc1.devtunnels.ms/calendar');
  url.searchParams.append('work_week', workWeek.toString());
  url.searchParams.append('start_date', startDate);
  url.searchParams.append('leave_balance', leaveBalance.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch calendar data');
  }
}

export async function markHoliday(
  calendar: CalendarResponse,
  date: string,
  holidayName: string
): Promise<CalendarResponse> {
  const url = 'https://jj21glhf-8000.inc1.devtunnels.ms/calendar/holidays';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendar,
        holidays: [{ date, public_holiday_name: holidayName }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to mark holiday');
  }
}

export async function planLeave(
  calendar: CalendarResponse,
  startDate: string,
  endDate: string,
  reason: string
): Promise<CalendarResponse> {
  const url = 'https://jj21glhf-8000.inc1.devtunnels.ms/calendar/leave';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendar,
        leave: {
          start_date: startDate,
          end_date: endDate,
          reason
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to plan leave');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}