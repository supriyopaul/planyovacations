import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import PlannerForm from './components/PlannerForm';
import YearlyCalendar from './components/YearlyCalendar';
import {
  fetchCalendarData,
  addPublicHolidaysByCountry,
  markHoliday,
  planLeave,
  deleteHoliday,
  deleteLeave,
} from './utils/api';
import type { CalendarResponse } from './types';

function App() {
  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<number>(18);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    workWeek: number,
    startDate: string,
    leaveBalanceInput: number,
    country: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      let data = await fetchCalendarData(workWeek, startDate, leaveBalanceInput);
      if (country) {
        data = await addPublicHolidaysByCountry(data, country);
      }
      setCalendarData(data);
      setLeaveBalance(data.leave_balance); // Update leave balance from calendar data
    } catch (err) {
      setError('Unable to fetch calendar data. Please try again later.');
      console.error('Failed to fetch calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateAction = async (
    date: string,
    name: string,
    type: 'holiday' | 'leave',
    endDate?: string
  ) => {
    if (!calendarData) return;
  
    setLoading(true);
    setError(null);
    try {
      const updatedData =
        type === 'holiday'
          ? await markHoliday(calendarData, date, name)
          : await planLeave(calendarData, date, endDate || date, name);
      setCalendarData(updatedData);
      setLeaveBalance(updatedData.leave_balance); // Update leave balance
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update calendar. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDateDelete = async (
    date: string,
    type: 'holiday' | 'leave',
    endDate?: string
  ) => {
    if (!calendarData) return;
  
    setLoading(true);
    setError(null);
    try {
      const updatedData =
        type === 'holiday'
          ? await deleteHoliday(calendarData, date)
          : await deleteLeave(calendarData, date, endDate || date);
      setCalendarData(updatedData);
      setLeaveBalance(updatedData.leave_balance); // Update leave balance
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update calendar. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveBalanceChange = (newBalance: number) => {
    setLeaveBalance(newBalance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <CalendarIcon className="h-16 w-16 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Maximize Your Time Off—Plan Smarter, Vacation Better!
          </h1>
          <p className="text-xl text-gray-600">
            Optimize your leave days and make the most of your precious time off
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
        <PlannerForm
          onSubmit={handleSubmit}
          leaveBalance={leaveBalance}
          onLeaveBalanceChange={handleLeaveBalanceChange}
          loading={loading}
        />
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {calendarData && calendarData.days.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <YearlyCalendar
              days={calendarData.days}
              onDateClick={handleDateAction}
              onDateDelete={handleDateDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;