import React, { useEffect, useState } from 'react';
import { addMonths, startOfMonth } from 'date-fns';
import { MonthGrid } from './MonthGrid';
import { Tutorial } from './Tutorial';

interface CalendarViewProps {
  workWeek: number;
  leaveBalance: number;
}

interface Day {
  date: string;
  isWeekend: boolean;
  isPublicHoliday: boolean;
  publicHolidayName: string;
  isPlannedLeave: boolean;
  isRecommended: boolean;
}

interface Calendar {
  leaveBalance: number;
  days: Day[];
}

export function CalendarView({ workWeek, leaveBalance }: CalendarViewProps) {
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/calendar?` +
          `work_week=${workWeek}&leave_balance=${leaveBalance}`
        );
  
        console.log('API Response:', response);
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          throw new Error(`Failed to fetch calendar data: ${errorText}`);
        }
  
        const data = await response.json();
        console.log('Parsed Data:', data);
        setCalendar(data);
      } catch (err) {
        console.error('Fetch Calendar Error:', err);
        setError('Unable to load calendar. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchCalendar();
  }, [workWeek, leaveBalance]);  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const months = Array.from({ length: 12 }, (_, i) => 
    startOfMonth(addMonths(new Date(), i))
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Your Year at a Glance</h2>
          <p className="text-gray-600">
            Plan your leaves strategically with our smart recommendations
          </p>
        </div>

        <div className="space-y-12">
          {months.map(month => (
            <MonthGrid
              key={month.toString()}
              month={month}
              days={calendar?.days || []}
            />
          ))}
        </div>
      </div>

      <Tutorial />
    </div>
  );
}