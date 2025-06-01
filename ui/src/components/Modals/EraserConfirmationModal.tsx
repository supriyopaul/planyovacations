import React from 'react';
import { X, AlertTriangle, Calendar } from 'lucide-react';
import { LeaveEvent, EventType } from '../../types';
import { isSameDay } from '../../utils/calendarUtils';

interface EraserConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventsToErase: LeaveEvent[];
  startDate: Date;
  endDate: Date;
}

export const EraserConfirmationModal: React.FC<EraserConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  eventsToErase,
  startDate,
  endDate
}) => {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    onClose();
  };

  const getEventTypeLabel = (type: EventType): string => {
    switch (type) {
      case EventType.HOLIDAY:
        return 'Public Holiday';
      case EventType.OPTIONAL_HOLIDAY:
        return 'Optional Holiday';
      case EventType.PLANNED_LEAVE:
        return 'Planned Leave';
      case EventType.BUSY_PERIOD:
        return 'Busy Period';
      case EventType.SLOW_PERIOD:
        return 'Slow Period';
      case EventType.SUGGESTED_LEAVE:
        return 'Suggested Leave';
      default:
        return type;
    }
  };

  const getEventTypeColor = (type: EventType): { bg: string; text: string; border: string } => {
    switch (type) {
      case EventType.HOLIDAY:
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case EventType.OPTIONAL_HOLIDAY:
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case EventType.PLANNED_LEAVE:
        return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
      case EventType.BUSY_PERIOD:
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      case EventType.SLOW_PERIOD:
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case EventType.SUGGESTED_LEAVE:
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasPlannedLeave = eventsToErase.some(event => event.type === EventType.PLANNED_LEAVE);
  const isSingleDay = startDate.getTime() === endDate.getTime();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Confirm Erase Events</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Date Range Display */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Calendar size={18} />
              <span className="font-medium">Selected Date Range</span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-slate-900">
                {isSingleDay ? formatDate(startDate) : `${formatDate(startDate)} - ${formatDate(endDate)}`}
              </div>
              {!isSingleDay && (
                <div className="text-sm text-slate-500 mt-1">
                  {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                </div>
              )}
            </div>
          </div>

          {hasPlannedLeave && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
              <AlertTriangle className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" size={18} />
              <p className="text-sm text-amber-700">
                This will remove planned leave events, which will affect your leave balance.
              </p>
            </div>
          )}

          {eventsToErase.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Events to be erased:</p>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md divide-y divide-slate-100">
                {eventsToErase.map(event => {
                  const colors = getEventTypeColor(event.type);
                  return (
                    <div 
                      key={event.id}
                      className={`p-3 ${colors.bg} ${colors.border} border-l-4`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={`font-medium ${colors.text}`}>{event.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {getEventTypeLabel(event.type)}
                          </p>
                        </div>
                        <div className="text-xs text-slate-500 text-right">
                          {formatDate(event.startDate)}
                          {!isSameDay(event.startDate, event.endDate) && (
                            <> - {formatDate(event.endDate)}</>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Erase Events
          </button>
        </div>
      </div>
    </div>
  );
}; 