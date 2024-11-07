import React, { useState } from 'react';
import { CalendarDay } from '../types';
import DateActionForm from './DateActionForm';
import Legend from './Legend';
import DeleteConfirmationPopup from './DeleteConfirmationPopup';

interface YearlyCalendarProps {
  days: CalendarDay[];
  onDateClick: (
    date: string,
    name: string,
    type: 'holiday' | 'leave',
    endDate?: string
  ) => void;
}

function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const YearlyCalendar: React.FC<YearlyCalendarProps> = ({
  days,
  onDateClick,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState<{ date: string; property: string } | null>(null);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const groupByMonth = (days: CalendarDay[]) => {
    const grouped: { [key: string]: CalendarDay[] } = {};
    days.forEach((day) => {
      const date = parseDateString(day.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(day);
    });
    return grouped;
  };

  const getMonthGrid = (monthDays: CalendarDay[]) => {
    if (!monthDays.length) return [];

    const sortedMonthDays = [...monthDays].sort(
      (a, b) => parseDateString(a.date).getTime() - parseDateString(b.date).getTime()
    );

    // Get the first day of the month, not just the first date in our range
    const firstDate = parseDateString(sortedMonthDays[0].date);
    const firstDayOfMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Create empty slots for days before the first day of month
    const grid: (CalendarDay | null)[] = Array(firstDayOfWeek).fill(null);

    // Create empty slots for days before our start date in the month
    const daysBeforeStart = firstDate.getDate() - 1;
    if (daysBeforeStart > 0) {
      grid.push(...Array(daysBeforeStart).fill(null));
    }

    // Add the actual days
    sortedMonthDays.forEach((day) => {
      grid.push(day);
    });

    return grid;
  };

  const getDayClass = (day: CalendarDay | null) => {
    if (!day) return 'invisible';

    let classes =
      'relative group h-8 w-8 rounded-full flex items-center justify-center text-sm cursor-pointer transition-colors ';

    if (day.date === selectedDate) {
      classes += 'ring-2 ring-indigo-500 ring-offset-2 ';
    }

    if (day.is_weekend) {
      classes += 'bg-gray-100 text-gray-500 hover:bg-gray-200 ';
    } else if (day.is_public_holiday) {
      classes += 'bg-purple-100 text-purple-800 hover:bg-purple-200 ';
    } else if (day.is_planned_leave) {
      classes += 'bg-green-100 text-green-800 hover:bg-green-200 ';
    } else if (day.is_recommended_leave) {
      classes += 'bg-blue-100 text-blue-800 hover:bg-blue-200 ';
    } else if (day.is_preferred_leave_period) {
      classes += 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ';
    } else if (day.is_unpreferred_leave_period) {
      classes += 'bg-red-100 text-red-800 hover:bg-red-200 ';
    } else {
      classes += 'hover:bg-gray-100 ';
    }

    return classes;
  };

  const handleDateClick = (date: string, day: CalendarDay) => {
    setError(null);
    if (day.is_public_holiday || day.is_planned_leave || day.is_recommended_leave || day.is_preferred_leave_period || day.is_unpreferred_leave_period) {
      const property = day.is_public_holiday ? 'Public Holiday' :
                       day.is_planned_leave ? 'Planned Leave' :
                       day.is_recommended_leave ? 'Recommended Leave' :
                       day.is_preferred_leave_period ? 'Preferred Vacation Period' :
                       'Preferred Work Period';
      setShowDeletePopup({ date, property });
    } else {
      if (selectedDate === date) {
        setSelectedDate(null);
      } else {
        setSelectedDate(date);
      }
    }
  };

  const handleDateAction = async (
    date: string,
    name: string,
    type: 'holiday' | 'leave',
    endDate?: string
  ) => {
    try {
      await onDateClick(date, name, type, endDate);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while processing your request.'
      );
    }
  };

  const groupedDays = groupByMonth(days);

  const handleDelete = async () => {
    if (!showDeletePopup || !calendarData) return;

    const { date, property } = showDeletePopup;
    setLoading(true);
    setError(null);

    try {
      let updatedData;
      switch (property) {
        case 'Public Holiday':
          updatedData = await deleteHoliday(calendarData, date, '');
          break;
        case 'Planned Leave':
        case 'Recommended Leave':
          updatedData = await deleteLeave(calendarData, date, date);
          break;
        case 'Preferred Vacation Period':
          updatedData = await markPreferredPeriod(calendarData, date, date);
          break;
        case 'Preferred Work Period':
          updatedData = await markUnpreferredPeriod(calendarData, date, date);
          break;
      }
      setCalendarData(updatedData);
      setLeaveBalance(updatedData.leave_balance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update calendar. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowDeletePopup(null);
    }
  };

  return (
    <div className="space-y-8">
      <Legend />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(groupedDays).map(([monthKey, monthDays]) => {
          const [year, monthIndex] = monthKey.split('-').map(Number);
          const monthName = months[monthIndex];
          const grid = getMonthGrid(monthDays);

          return (
            <div key={monthKey} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-4">
                {`${monthName} ${year}`}
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
                {grid.map((day, index) => (
                  <div key={index} className="relative">
                    {day ? (
                      <div
                        className={getDayClass(day)}
                        onClick={() => handleDateClick(day.date, day)}
                      >
                        {parseDateString(day.date).getDate()}
                        <div className="hidden group-hover:block absolute z-10 -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {day.is_public_holiday
                            ? day.public_holiday_name
                            : day.is_planned_leave
                            ? day.leave_reason
                            : 'Click to add holiday or leave'}
                        </div>
                      </div>
                    ) : (
                      <div className="h-8 w-8"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <DateActionForm
          date={selectedDate}
          onSubmit={handleDateAction}
          onCancel={() => setSelectedDate(null)}
        />
      )}

      {showDeletePopup && (
        <DeleteConfirmationPopup
          date={showDeletePopup.date}
          property={showDeletePopup.property}
          onDelete={handleDelete}
          onCancel={() => setShowDeletePopup(null)}
        />
      )}
    </div>
  );
};

export default YearlyCalendar;
