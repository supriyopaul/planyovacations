import type { CalendarResponse } from '../types';

//const BASE_URL = 'https://jj21glhf-8000.inc1.devtunnels.ms';
const BASE_URL = 'http://localhost:8000';

export async function fetchCalendarData(
  workWeek: number,
  startDate: string,
  leaveBalance: number
): Promise<CalendarResponse> {
  const url = new URL(`${BASE_URL}/calendar`);
  url.searchParams.append('work_week', workWeek.toString());
  url.searchParams.append('start_date', startDate);
  url.searchParams.append('leave_balance', leaveBalance.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data: CalendarResponse = await response.json();
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
  const url = `${BASE_URL}/calendar/holidays`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendar,
        holidays: [{ date, public_holiday_name: holidayName }],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: CalendarResponse = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to mark holiday');
  }
}

export async function deleteHoliday(
  calendar: CalendarResponse,
  date: string
): Promise<CalendarResponse> {
  const url = `${BASE_URL}/calendar/holiday/delete`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendar,
        holiday_date: date,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to delete holiday');
  }
}

export async function planLeave(
  calendar: CalendarResponse,
  startDate: string,
  endDate: string,
  reason: string
): Promise<CalendarResponse> {
  const url = `${BASE_URL}/calendar/leave`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendar,
        from_date: startDate,
        to_date: endDate,
        leave_reason: reason,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to plan leave');
    }

    const data: CalendarResponse = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function deleteLeave(
  calendar: CalendarResponse,
  startDate: string,
  endDate: string
): Promise<CalendarResponse> {
  const url = `${BASE_URL}/calendar/leave/delete`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendar,
        from_date: startDate,
        to_date: endDate,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete leave');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getSupportedCountries(): Promise<{ name: string; code: string }[]> {
  const url = `${BASE_URL}/countries`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: { name: string; code: string }[] = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch supported countries');
  }
}

export async function addPublicHolidaysByCountry(
  calendar: CalendarResponse,
  country: string
): Promise<CalendarResponse> {
  const url = `${BASE_URL}/calendar/holiday/country`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendar,
        holiday_country: country,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to add public holidays by country');
    }

    const data: CalendarResponse = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to add public holidays by country');
  }
}

export async function markPreferredPeriod(
  calendar: CalendarResponse,
  startDate: string,
  endDate: string
): Promise<CalendarResponse> {
  const url = `${BASE_URL}/calendar/preferred`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendar,
        from_date: startDate,
        to_date: endDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to mark preferred period');
  }
}

export async function markUnpreferredPeriod(
  calendar: CalendarResponse,
  startDate: string,
  endDate: string
): Promise<CalendarResponse> {
  const url = `${BASE_URL}/calendar/unpreferred`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendar,
        from_date: startDate,
        to_date: endDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to mark unpreferred period');
  }
}

export async function deletePreferredPeriod(
  calendar: CalendarResponse,
  startDate: string,
  endDate: string
): Promise<CalendarResponse> {
  const url = `${BASE_URL}/calendar/preferred/delete`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendar,
        from_date: startDate,
        to_date: endDate,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete preferred period');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function deleteUnpreferredPeriod(
  calendar: CalendarResponse,
  startDate: string,
  endDate: string
): Promise<CalendarResponse> {
  const url = `${BASE_URL}/calendar/unpreferred/delete`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calendar,
        from_date: startDate,
        to_date: endDate,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete unpreferred period');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function recommendLeaves(
  calendar: CalendarResponse
): Promise<CalendarResponse> {
  const url = `${BASE_URL}/calendar/recommend_leaves`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(calendar),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get leave recommendations');
    }
    return await response.json();
  } catch (error) {
    throw new Error('Failed to get leave recommendations');
  }
}

export async function rejectRecommendedLeave(
  calendar: CalendarResponse,
  date: string
): Promise<CalendarResponse> {
  const url = `${BASE_URL}/calendar/reject_recommended_leave`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calendar,
        date_to_reject: date,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to reject recommended leave');
    }
    return await response.json();
  } catch (error) {
    throw new Error('Failed to reject recommended leave');
  }
}
