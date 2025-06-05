import React, { useState, useRef } from 'react';
import { Menu, X, Paintbrush, Import, Download, Settings, Calendar, ChevronLeft, ChevronRight, Eraser as EraserIcon } from 'lucide-react';
import { SidebarProps } from '../../types';
import { useLeave } from '../../context/LeaveContext';
import { LeavePreferenceSlider } from '../QuickActions/LeavePreferenceSlider';
import { SuggestedLeaveList } from '../QuickActions/SuggestedLeaveList';
import { WeekendMarker } from '../WeekendMarker';
import { EventType, CalendarExportData } from '../../types';
import { exportCalendarDataToPDF } from '../../utils/calendarUtils';

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
    hoverBg: 'hover:bg-blue-50',
    activeBg: 'bg-blue-50',
    ring: 'ring-blue-400'
  },
  {
    type: EventType.OPTIONAL_HOLIDAY,
    label: 'Optional Holiday',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    hoverBg: 'hover:bg-yellow-50',
    activeBg: 'bg-yellow-50',
    ring: 'ring-yellow-400'
  },
  {
    type: EventType.PLANNED_LEAVE,
    label: 'Planned Leave',
    color: 'text-teal-600',
    bg: 'bg-teal-100',
    hoverBg: 'hover:bg-teal-50',
    activeBg: 'bg-teal-50',
    ring: 'ring-teal-400'
  },
  {
    type: EventType.BUSY_PERIOD,
    label: 'Busy Work Period',
    color: 'text-red-600',
    bg: 'bg-red-100',
    hoverBg: 'hover:bg-red-50',
    activeBg: 'bg-red-50',
    ring: 'ring-red-400'
  },
  {
    type: EventType.SLOW_PERIOD,
    label: 'Slow Work Period',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    hoverBg: 'hover:bg-orange-50',
    activeBg: 'bg-orange-50',
    ring: 'ring-orange-400'
  },
  {
    type: EventType.ERASER,
    label: 'Eraser',
    color: 'text-slate-500',
    bg: 'bg-slate-200',
    hoverBg: 'hover:bg-slate-50',
    activeBg: 'bg-slate-50',
    ring: 'ring-slate-400'
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
    generateSuggestions,
    exportCalendarData,
    importCalendarData,
    offDays: contextOffDays,
    setOffDays: setContextOffDays,
    localStorageAvailable
  } = useLeave();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleExport = () => {
    try {
      const data = exportCalendarData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendar-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export calendar data');
      console.error('Export error:', err);
    }
  };

  const handleExportPDF = () => {
    try {
      const data = exportCalendarData();
      exportCalendarDataToPDF(data);
    } catch (err) {
      setError('Failed to export calendar PDF');
      console.error('Export PDF error:', err);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as CalendarExportData;
        importCalendarData(data);
        setError(null);
      } catch (err) {
        setError('Failed to import calendar data. Please check the file format.');
        console.error('Import error:', err);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file');
    };
    reader.readAsText(file);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`bg-white border-r border-slate-300 h-full flex flex-col overflow-y-auto ${sidebarClasses}`}>
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
              className={`
                flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all
                ${selectedBrush === brush.type 
                  ? `ring-2 ring-offset-2 ${brush.ring} ${brush.activeBg} shadow-sm` 
                  : 'hover:bg-slate-50 hover:shadow-sm'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:${brush.ring}
              `}
              title={brush.label}
              onClick={() => {
                if (selectedBrush === brush.type) {
                  setSelectedBrush(null);
                } else {
                  setSelectedBrush(brush.type);
                }
              }}
              type="button"
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${brush.bg} transition-colors ${selectedBrush === brush.type ? brush.activeBg : ''}`}>
                {brush.type === EventType.ERASER ? (
                  <EraserIcon size={18} className={brush.color} />
                ) : (
                  <Paintbrush size={18} className={brush.color} />
                )}
              </span>
              <span className={`text-xs font-medium whitespace-nowrap ${selectedBrush === brush.type ? 'font-semibold' : ''}`}>
                {brush.type === EventType.ERASER ? brush.label : `Mark ${brush.label}`}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Leave Style Preferences - Only one slider */}
      <div className="px-4 py-4 border-b border-slate-300">
        <h3 className="text-sm font-medium text-slate-600 mb-3">Leave Style Preferences</h3>
        {/* Use the context-based LeavePreferenceSlider */}
        <LeavePreferenceSlider />
        {/* Only the Generate Suggestions button, no suggestions or empty state */}
        <div className="mt-6">
          <button
            className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-md transition-colors"
            // No-op for now
            onClick={() => {}}
          >
            Generate Suggestions
          </button>
        </div>
        {/* Export/Import buttons placed here for visibility */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            title="Export Calendar Data"
          >
            <Download size={20} />
            {!isCollapsed && <span>Export</span>}
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            title="Export Calendar as PDF"
          >
            <Download size={20} />
            {!isCollapsed && <span>Export PDF</span>}
          </button>
          <button
            onClick={triggerImport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
            title="Import Calendar Data"
          >
            <Import size={20} />
            {!isCollapsed && <span>Import</span>}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          {error && (
            <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
      {/* Modal warning if localStorage is unavailable */}
      {!localStorageAvailable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Warning: Data Not Saved</h2>
            <p className="text-slate-700 mb-4">Your calendar data cannot be saved in this browser. All changes will be lost after a refresh or closing the tab. Please enable localStorage or use a supported browser.</p>
            <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      )}
    </div>
  );
};