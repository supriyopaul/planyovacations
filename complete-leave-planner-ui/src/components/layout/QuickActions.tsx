import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';
import { useAppStore } from '../../store/appStore';
import { useCalendarStore } from '../../store/calendarStore';

interface SuggestionCardProps {
  title: string;
  duration: number;
  startDate: string;
  endDate: string;
  onApply: () => void;
  onDismiss: () => void;
}

function SuggestionCard({
  title,
  duration,
  startDate,
  endDate,
  onApply,
  onDismiss,
}: SuggestionCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-slate-900">{title}</h4>
          <p className="mt-1 text-sm text-slate-500">
            {duration} days • {startDate} to {endDate}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="default" size="sm" onClick={onApply}>
          Apply Suggestion
        </Button>
      </div>
    </div>
  );
}

export function QuickActions() {
  const { quickActionsExpanded, toggleQuickActions } = useAppStore();
  const { suggestions, preferences, setPreferences } = useCalendarStore();

  if (!quickActionsExpanded) {
    return (
      <button
        onClick={toggleQuickActions}
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 transform rounded-l-lg bg-white p-2 shadow-lg"
      >
        <span className="sr-only">Show quick actions</span>
        <svg
          className="h-5 w-5 text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    );
  }

  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-quick-actions transform bg-white shadow-lg transition-all duration-300">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleQuickActions}
            className="ml-auto"
          >
            <span className="sr-only">Hide quick actions</span>
            <svg
              className="h-5 w-5 transform rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Preferences */}
          <div className="mb-6">
            <h3 className="mb-4 text-sm font-medium text-slate-900">
              Leave Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-slate-700"
                >
                  Preferred Duration (days)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={preferences.preferredDuration}
                  onChange={(e) =>
                    setPreferences({
                      preferredDuration: parseInt(e.target.value, 10),
                    })
                  }
                  min="1"
                  max="30"
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Preferences
                </label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.avoidBusyPeriods}
                      onChange={(e) =>
                        setPreferences({
                          avoidBusyPeriods: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Avoid busy periods
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.maximizeLongWeekends}
                      onChange={(e) =>
                        setPreferences({
                          maximizeLongWeekends: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Maximize long weekends
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <h3 className="mb-4 text-sm font-medium text-slate-900">
              Suggested Leaves
            </h3>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  title={suggestion.title}
                  duration={suggestion.endDate ? 
                    Math.ceil((new Date(suggestion.endDate).getTime() - new Date(suggestion.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 1}
                  startDate={new Date(suggestion.startDate).toLocaleDateString()}
                  endDate={new Date(suggestion.endDate).toLocaleDateString()}
                  onApply={() => {
                    // TODO: Implement apply suggestion
                  }}
                  onDismiss={() => {
                    // TODO: Implement dismiss suggestion
                  }}
                />
              ))}
              {suggestions.length === 0 && (
                <p className="text-sm text-slate-500">
                  No suggestions available. Adjust your preferences or click "Suggest Leave" to generate new suggestions.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
} 