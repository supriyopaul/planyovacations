import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { EventType } from '../../types';
import { useLeave } from '../../context/LeaveContext';

interface EventCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; type: EventType; startDate: Date; endDate: Date }) => void;
  eventType: EventType;
  startDate: Date;
  endDate: Date;
}

export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  open,
  onClose,
  onSubmit,
  eventType,
  startDate,
  endDate
}) => {
  const { events } = useLeave();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [showConversionPrompt, setShowConversionPrompt] = useState(false);
  const [selectedType, setSelectedType] = useState<EventType>(eventType);

  // Ensure dates are always ordered correctly
  const { displayStartDate, displayEndDate, overlappingEvents } = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // Check for overlapping events based on type
    const overlapping = events.filter(event => {
      // For holiday types and planned leave
      if (eventType === EventType.HOLIDAY || eventType === EventType.OPTIONAL_HOLIDAY || eventType === EventType.PLANNED_LEAVE) {
        if (event.type !== EventType.HOLIDAY && event.type !== EventType.OPTIONAL_HOLIDAY && event.type !== EventType.PLANNED_LEAVE) {
          return false;
        }
      }
      // For work period types
      else if (eventType === EventType.BUSY_PERIOD || eventType === EventType.SLOW_PERIOD) {
        if (event.type !== EventType.BUSY_PERIOD && event.type !== EventType.SLOW_PERIOD) {
          return false;
        }
      }
      // For other types, no overlap handling needed
      else {
        return false;
      }

      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);
      return (start <= eventEnd && eventStart <= end);
    });

    // If there are overlapping events of different types, show conversion prompt
    if (overlapping.length > 0 && overlapping.some(e => e.type !== eventType)) {
      setShowConversionPrompt(true);
    } else {
      setShowConversionPrompt(false);
    }
    
    return {
      displayStartDate: start < end ? start : end,
      displayEndDate: start < end ? end : start,
      overlappingEvents: overlapping
    };
  }, [startDate, endDate, events, eventType]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title for the event');
      return;
    }

    onSubmit({
      title: title.trim(),
      type: selectedType,
      startDate: displayStartDate,
      endDate: displayEndDate
    });

    // Reset form
    setTitle('');
    setError('');
    setShowConversionPrompt(false);
    setSelectedType(eventType);
  };

  const handleCancel = () => {
    setTitle('');
    setError('');
    setShowConversionPrompt(false);
    setSelectedType(eventType);
    onClose();
  };

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case EventType.HOLIDAY:
        return 'bg-blue-100 text-blue-700';
      case EventType.OPTIONAL_HOLIDAY:
        return 'bg-yellow-100 text-yellow-700';
      case EventType.PLANNED_LEAVE:
        return 'bg-teal-100 text-teal-700';
      case EventType.BUSY_PERIOD:
        return 'bg-red-100 text-red-700';
      case EventType.SLOW_PERIOD:
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {showConversionPrompt ? 'Convert Event Type' : 'Create New Event'}
          </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Title input */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
              placeholder="Enter event title..."
              required
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          {/* Date range display */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date Range
            </label>
            <div className="text-sm text-slate-600">
              {formatDate(displayStartDate)} - {formatDate(displayEndDate)}
            </div>
        </div>

          {/* Conversion prompt */}
          {showConversionPrompt && (
            <>
              {(eventType === EventType.HOLIDAY || eventType === EventType.OPTIONAL_HOLIDAY || eventType === EventType.PLANNED_LEAVE) ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Event Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="eventType"
                        value={EventType.HOLIDAY}
                        checked={selectedType === EventType.HOLIDAY}
                        onChange={() => setSelectedType(EventType.HOLIDAY)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(EventType.HOLIDAY)}`}>
                        Public Holiday
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="eventType"
                        value={EventType.OPTIONAL_HOLIDAY}
                        checked={selectedType === EventType.OPTIONAL_HOLIDAY}
                        onChange={() => setSelectedType(EventType.OPTIONAL_HOLIDAY)}
                        className="text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(EventType.OPTIONAL_HOLIDAY)}`}>
                        Optional Holiday
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="eventType"
                        value={EventType.PLANNED_LEAVE}
                        checked={selectedType === EventType.PLANNED_LEAVE}
                        onChange={() => setSelectedType(EventType.PLANNED_LEAVE)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(EventType.PLANNED_LEAVE)}`}>
                        Planned Leave
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Work Period Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="workPeriodType"
                        value={EventType.BUSY_PERIOD}
                        checked={selectedType === EventType.BUSY_PERIOD}
                        onChange={() => setSelectedType(EventType.BUSY_PERIOD)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(EventType.BUSY_PERIOD)}`}>
                        Busy Period
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="workPeriodType"
                        value={EventType.SLOW_PERIOD}
                        checked={selectedType === EventType.SLOW_PERIOD}
                        onChange={() => setSelectedType(EventType.SLOW_PERIOD)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(EventType.SLOW_PERIOD)}`}>
                        Slow Period
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Event type display (when not converting) */}
          {!showConversionPrompt && (
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(eventType)}`}>
                {eventType.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {showConversionPrompt ? 'Convert' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 