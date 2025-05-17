import React from 'react';
import { Check, X, Lightbulb } from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import { EventType } from '../../types';

export const SuggestedLeaveList: React.FC = () => {
  const { suggestedLeave, addEvent } = useLeave();
  
  const handleAcceptSuggestion = (id: string) => {
    const suggestion = suggestedLeave.find(event => event.id === id);
    if (suggestion) {
      // Convert to planned leave and add to calendar
      addEvent({
        title: suggestion.title,
        description: suggestion.description,
        startDate: suggestion.startDate,
        endDate: suggestion.endDate,
        type: EventType.PLANNED_LEAVE
      });
    }
  };
  
  if (suggestedLeave.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="bg-amber-100 p-4 rounded-lg inline-block mb-2">
          <Lightbulb className="text-amber-500 mx-auto" size={24} />
        </div>
        <p className="text-slate-600">
          No leave suggestions yet. Adjust your preferences and generate suggestions.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-600 mb-3">Suggested Leave Periods</h3>
      
      <div className="space-y-3">
        {suggestedLeave.map((suggestion) => {
          const startDate = new Date(suggestion.startDate);
          const endDate = new Date(suggestion.endDate);
          
          // Calculate days
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          
          return (
            <div key={suggestion.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{suggestion.title}</h4>
                <span className="text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                  {diffDays} days
                </span>
              </div>
              
              <p className="text-sm text-slate-600 mt-1 mb-2">
                {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(startDate)} - {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(endDate)}
              </p>
              
              {suggestion.description && (
                <p className="text-xs text-slate-600 mb-2">{suggestion.description}</p>
              )}
              
              <div className="flex justify-end gap-2 mt-1">
                <button 
                  className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  aria-label="Decline suggestion"
                >
                  <X size={16} />
                </button>
                <button 
                  className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  aria-label="Accept suggestion"
                  onClick={() => handleAcceptSuggestion(suggestion.id)}
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};