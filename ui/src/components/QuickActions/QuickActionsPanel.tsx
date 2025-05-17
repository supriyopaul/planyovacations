import React from 'react';
import { ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';
import { QuickActionsPanelProps } from '../../types';
import { LeavePreferenceSlider } from './LeavePreferenceSlider';
import { SuggestedLeaveList } from './SuggestedLeaveList';
import { useLeave } from '../../context/LeaveContext';

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { generateSuggestions } = useLeave();
  
  const panelClasses = isCollapsed
    ? 'w-12 transition-all duration-300 ease-in-out'
    : 'w-80 transition-all duration-300 ease-in-out';
    
  return (
    <div className={`bg-white border-l border-slate-300 h-full flex flex-col ${panelClasses}`}>
      <div className="p-4 border-b border-slate-300 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Lightbulb className="text-amber-500" size={18} />
            Leave Suggestions
          </h2>
        )}
        
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {isCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
      
      {!isCollapsed && (
        <>
          <div className="p-4 border-b border-slate-300">
            <h3 className="text-sm font-medium text-slate-600 mb-3">Leave Style Preferences</h3>
            <LeavePreferenceSlider />
            
            <div className="mt-4">
              <button 
                onClick={generateSuggestions}
                className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-white font-medium rounded-md transition-colors"
              >
                Generate Suggestions
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <SuggestedLeaveList />
          </div>
        </>
      )}
    </div>
  );
};