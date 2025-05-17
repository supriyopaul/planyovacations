import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CalendarRange } from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import { formatDate } from '../../utils/calendarUtils';

export const CalendarHeader: React.FC = () => {
  const { 
    currentDate, 
    setCurrentDate, 
    calendarView, 
    setCalendarView,
    leaveBalance,
    startDate,
    endDate,
    setDateRange
  } = useLeave();

  const handlePreviousClick = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'year') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNextClick = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'year') {
      newDate.setFullYear(newDate.getFullYear() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const date = new Date(value);
    setDateRange(name === 'startDate' ? date : startDate, name === 'endDate' ? date : endDate);
  };

  return (
    <div className="p-4 border-b border-slate-300 bg-white flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousClick}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-xl font-semibold">
            {calendarView === 'year' 
              ? currentDate.getFullYear()
              : formatDate(currentDate)
            }
          </h2>
          
          <button 
            onClick={handleNextClick}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <button 
          onClick={handleTodayClick}
          className="px-3 py-1 border border-slate-300 rounded-md hover:bg-slate-100 transition-colors text-sm"
        >
          Today
        </button>
        
        <div className="border border-slate-300 rounded-md overflow-hidden flex">
          <button 
            onClick={() => setCalendarView('year')}
            className={`px-3 py-1 flex items-center gap-1 text-sm ${
              calendarView === 'year' 
                ? 'bg-slate-100 font-medium' 
                : 'hover:bg-slate-50'
            }`}
          >
            <CalendarRange size={16} />
            <span>Year</span>
          </button>
          <button 
            onClick={() => setCalendarView('week')}
            className={`px-3 py-1 flex items-center gap-1 text-sm ${
              calendarView === 'week' 
                ? 'bg-slate-100 font-medium' 
                : 'hover:bg-slate-50'
            }`}
          >
            <CalendarIcon size={16} />
            <span>Week</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label htmlFor="startDate" className="block text-xs text-slate-600">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={startDate?.toISOString().split('T')[0] || ''}
              onChange={handleDateRangeChange}
              className="mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs text-slate-600">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={endDate?.toISOString().split('T')[0] || ''}
              onChange={handleDateRangeChange}
              className="mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="text-sm">
          <span className="text-slate-600">Leave Balance:</span>
          <div className="flex gap-3 mt-1">
            <div className="flex flex-col items-center">
              <span className="font-semibold">{leaveBalance.total}</span>
              <span className="text-xs text-slate-600">Total</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">{leaveBalance.used}</span>
              <span className="text-xs text-slate-600">Used</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">{leaveBalance.planned}</span>
              <span className="text-xs text-slate-600">Planned</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-teal-500">{leaveBalance.remaining}</span>
              <span className="text-xs text-slate-600">Remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};