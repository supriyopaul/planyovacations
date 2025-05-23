import React, { useState } from 'react';
import { Menu, X, Paintbrush, Import, Import as Export, Settings, Calendar, ChevronLeft, ChevronRight, Eraser as EraserIcon } from 'lucide-react';
import { SidebarProps } from '../../types';
import { useLeave } from '../../context/LeaveContext';
import { LeavePreferenceSlider } from '../QuickActions/LeavePreferenceSlider';
import { SuggestedLeaveList } from '../QuickActions/SuggestedLeaveList';
import { WeekendMarker } from '../WeekendMarker';
import { EventType } from '../../types';

// Utility to format date for input type=date
const formatDateInput = (date: Date | null) =>
  date ? date.toISOString().split('T')[0] : '';

interface SidebarWithOffDaysProps extends SidebarProps {
  setOffDays: (offDays: number[]) => void;
  selectedBrush: EventType | null;
  setSelectedBrush: (brush: EventType | null) => void;
}

const brushTypes = [
  {
    type: EventType.HOLIDAY,
    label: 'Public Holiday',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    type: EventType.OPTIONAL_HOLIDAY,
    label: 'Optional Holiday',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
  },
  {
    type: EventType.PLANNED_LEAVE,
    label: 'Planned Leave',
    color: 'text-teal-600',
    bg: 'bg-teal-100',
  },
  {
    type: EventType.BUSY_PERIOD,
    label: 'Busy Work Period',
    color: 'text-red-600',
    bg: 'bg-red-100',
  },
  {
    type: EventType.SLOW_PERIOD,
    label: 'Slow Work Period',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
  },
  {
    type: 'eraser',
    label: 'Eraser',
    color: 'text-slate-500',
    bg: 'bg-slate-200',
  },
];

export const Sidebar: React.FC<SidebarWithOffDaysProps> = ({ isCollapsed, onToggleCollapse, setOffDays, selectedBrush, setSelectedBrush }) => {
  const {
    setIsCreatingEvent,
    calendarView,
    setCalendarView,
    currentDate,
    setCurrentDate,
    startDate,
    endDate,
    setDateRange,
    leaveBalance,
    setLeaveBalance,
    generateSuggestions
  } = useLeave();

  // Date range handlers
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let date: Date | null = null;
    if (value) {
      date = new Date(value);
      if (isNaN(date.getTime())) date = null;
    }
    if (name === 'startDate') {
      setDateRange(date, endDate);
    } else {
      setDateRange(startDate, date);
    }
  };

  // Leave balance handler
  const handleLeaveBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const total = parseInt(e.target.value, 10) || 0;
    setLeaveBalance({ ...leaveBalance, total });
  };

  // Navigation handlers
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

  const sidebarClasses = isCollapsed 
    ? 'w-16 transition-all duration-300 ease-in-out'
    : 'w-64 transition-all duration-300 ease-in-out';
    
  const handleAddLeave = () => {
    setIsCreatingEvent(true);
  };

  return (
    <div className={`bg-white border-r border-slate-300 h-full flex flex-col ${sidebarClasses}`}>
      <div className="p-4 border-b border-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="text-teal-500" size={24} />
          {!isCollapsed && <h1 className="font-bold text-xl">Leave Planner</h1>}
        </div>
        
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>
      
      {/* Only show Start Date and End Date selectors at the top */}
      <div className="px-4 py-3 border-b border-slate-300">
        <div className="flex flex-col gap-2">
          <div>
            <label htmlFor="startDate" className="block text-xs text-slate-600">Start Date</label>
            <input type="date" id="startDate" name="startDate" value={formatDateInput(startDate)} onChange={handleDateRangeChange} className="mt-1 px-2 py-1 border border-slate-300 rounded text-sm w-full" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs text-slate-600">End Date</label>
            <input type="date" id="endDate" name="endDate" value={formatDateInput(endDate)} onChange={handleDateRangeChange} className="mt-1 px-2 py-1 border border-slate-300 rounded text-sm w-full" />
          </div>
        </div>
        <div className="mt-4">
          <WeekendMarker onChange={setOffDays} />
        </div>
      </div>
      
      {/* Editable Leave Balance */}
      <div className="px-4 py-3 border-b border-slate-300">
        <h3 className="text-sm font-medium text-slate-600 mb-2">Leave Balance</h3>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <label htmlFor="leave-balance-total" className="text-xs text-slate-600 mb-1">Total</label>
            <input type="number" id="leave-balance-total" min={0} value={leaveBalance.total} onChange={handleLeaveBalanceChange} className="w-16 px-2 py-1 border border-slate-300 rounded text-sm text-center" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-600 mb-1">Used</span>
            <span className="text-lg font-semibold">{leaveBalance.planned}</span>
          </div>
        </div>
      </div>
      
      {/* Paint Brush Legend for Marking */}
      <div className="px-2 py-4 border-b border-slate-300">
        <h3 className="px-2 mb-2 text-xs font-medium text-slate-500 uppercase">Marking Brushes</h3>
        <div className="flex flex-col gap-2">
          {brushTypes.map((brush) => (
            <button
              key={brush.type}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-all ${selectedBrush === brush.type ? 'ring-2 ring-offset-2 ring-teal-400 bg-slate-50' : 'hover:bg-slate-100'}`}
              title={brush.label}
              onClick={() => setSelectedBrush(selectedBrush === brush.type ? null : brush.type)}
              type="button"
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${brush.bg}`}>
                {brush.type === 'eraser' ? (
                  <EraserIcon size={18} className={brush.color} />
                ) : (
                  <Paintbrush size={18} className={brush.color} />
                )}
              </span>
              <span className="text-xs font-medium whitespace-nowrap">{brush.type === 'eraser' ? brush.label : `Mark ${brush.label}`}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Leave Suggestions (Preferences, Button, List) */}
      <div className="px-4 py-4 border-b border-slate-300">
        <h3 className="text-sm font-medium text-slate-600 mb-3">Leave Style Preferences</h3>
        <LeavePreferenceSlider />
        <div className="mt-4">
          <button onClick={generateSuggestions} className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-white font-medium rounded-md transition-colors">Generate Suggestions</button>
        </div>
        <div className="mt-4">
          <SuggestedLeaveList />
        </div>
      </div>
      
      {/* Tools (Export, Import, Settings) */}
      <div className="px-2 py-4 mt-auto border-t border-slate-300">
        <h3 className={`px-2 mb-2 text-xs font-medium text-slate-500 uppercase ${isCollapsed ? 'sr-only' : ''}`}>
          Tools
        </h3>
        
        <button className="w-full flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-slate-100 text-left mb-1 transition-colors">
          <Export size={20} className="text-slate-500 min-w-5" />
          {!isCollapsed && <span className="font-medium">Export Data</span>}
        </button>
        
        <button className="w-full flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-slate-100 text-left mb-1 transition-colors">
          <Import size={20} className="text-slate-500 min-w-5" />
          {!isCollapsed && <span className="font-medium">Import Data</span>}
        </button>
        
        <button className="w-full flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-slate-100 text-left transition-colors">
          <Settings size={20} className="text-slate-500 min-w-5" />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </button>
      </div>
    </div>
  );
};