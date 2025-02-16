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
  markPreferredPeriod,
  markUnpreferredPeriod,
  deletePreferredPeriod,
  deleteUnpreferredPeriod,
  recommendLeaves,
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
      // Removed automatic recommendations call here
      setCalendarData(data);
      setLeaveBalance(data.leave_balance);
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
    type: 'holiday' | 'leave' | 'preferred' | 'unpreferred',
    endDate?: string
  ) => {
    if (!calendarData) return;
  
    setLoading(true);
    setError(null);
    try {
      let updatedData;
      switch (type) {
        case 'holiday':
          updatedData = await markHoliday(calendarData, date, name);
          break;
        case 'leave':
          updatedData = await planLeave(calendarData, date, endDate || date, name);
          break;
        case 'preferred':
          updatedData = await markPreferredPeriod(calendarData, date, endDate || date);
          break;
        case 'unpreferred':
          updatedData = await markUnpreferredPeriod(calendarData, date, endDate || date);
          break;
      }
      // Removed automatic recommendations call here
      setCalendarData(updatedData);
      setLeaveBalance(updatedData.leave_balance);
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
    type: 'holiday' | 'leave' | 'preferred' | 'unpreferred',
    endDate?: string
  ) => {
    if (!calendarData) return;
  
    setLoading(true);
    setError(null);
    try {
      let updatedData;
      if (type === 'holiday') {
        updatedData = await deleteHoliday(calendarData, date);
      } else if (type === 'leave') {
        updatedData = await deleteLeave(calendarData, date, endDate || date);
      } else if (type === 'preferred') {
        updatedData = await deletePreferredPeriod(calendarData, date, endDate || date);
      } else if (type === 'unpreferred') {
        updatedData = await deleteUnpreferredPeriod(calendarData, date, endDate || date);
      }
      // Removed automatic recommendations call here
      setCalendarData(updatedData);
      setLeaveBalance(updatedData.leave_balance);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update calendar. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLoadRecommendations = async () => {
    if (!calendarData) return;
    setLoading(true);
    setError(null);
    try {
      const updatedData = await recommendLeaves(calendarData);
      setCalendarData(updatedData);
      setLeaveBalance(updatedData.leave_balance);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCalendarData(null);
  };

  const handleLeaveBalanceChange = (newBalance: number) => {
    setLeaveBalance(newBalance);
  };

  const handleImport = (importedData: CalendarResponse) => {
    try {
      setCalendarData(importedData);
      setLeaveBalance(importedData.leave_balance);
    } catch (err) {
      setError('Failed to import calendar data');
    }
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
            onReset={handleReset}
            onLoadRecommendations={handleLoadRecommendations}
            leaveBalance={leaveBalance}
            onLeaveBalanceChange={handleLeaveBalanceChange}
            loading={loading}
            isCalendarLoaded={!!calendarData}
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
              calendarData={calendarData}
              onDateClick={handleDateAction}
              onDateDelete={handleDateDelete}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
              onImport={handleImport}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
