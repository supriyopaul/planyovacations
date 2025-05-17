import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import { EventType } from '../../types';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  eventType?: EventType | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

export const EventModal: React.FC<EventModalProps> = ({ open, onClose, eventType, startDate, endDate }) => {
  const {
    activeEventId,
    setIsCreatingEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    events,
    setActiveEventId
  } = useLeave();

  const isEditing = Boolean(activeEventId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: EventType.PLANNED_LEAVE
  });

  // Populate form data for editing
  useEffect(() => {
    if (isEditing) {
      const event = events.find(e => e.id === activeEventId);
      if (event) {
        setFormData({
          title: event.title,
          description: event.description || '',
          startDate: new Date(event.startDate).toISOString().split('T')[0],
          endDate: new Date(event.endDate).toISOString().split('T')[0],
          type: event.type
        });
      }
    } else {
      // For new event, use props
      setFormData({
        title: '',
        description: '',
        startDate: startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        type: eventType || EventType.PLANNED_LEAVE
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEventId, events, eventType, startDate, endDate]);

  const handleClose = () => {
    setIsCreatingEvent(false);
    setActiveEventId(null);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        type: formData.type as EventType
      };
      updateEvent(activeEventId, eventData);
    } else {
      if (!eventType || !startDate || !endDate) return;
      // Merge/extend logic: repeatedly expand window to include all overlapping/adjacent events
      let mergedStart = startDate;
      let mergedEnd = endDate;
      let toDelete = new Set();
      let changed = true;
      while (changed) {
        changed = false;
        events.forEach(ev => {
          if (ev.type === eventType) {
            const evStart = new Date(ev.startDate);
            const evEnd = new Date(ev.endDate);
            // Overlaps or adjacent
            if (
              (mergedStart <= evEnd && mergedEnd >= evStart) ||
              (Math.abs(evStart.getTime() - mergedEnd.getTime()) === 86400000) ||
              (Math.abs(mergedStart.getTime() - evEnd.getTime()) === 86400000)
            ) {
              if (evStart < mergedStart) { mergedStart = evStart; changed = true; }
              if (evEnd > mergedEnd) { mergedEnd = evEnd; changed = true; }
              toDelete.add(ev.id);
            }
          }
        });
      }
      // Delete all merged events
      toDelete.forEach(id => deleteEvent(id));
      // Add the merged event
      const eventData = {
        title: formData.title,
        description: '',
        startDate: mergedStart,
        endDate: mergedEnd,
        type: eventType
      };
      addEvent(eventData);
    }
    handleClose();
  };

  const handleDelete = () => {
    if (activeEventId) {
      deleteEvent(activeEventId);
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-300">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar size={18} className="text-teal-500" />
            {isEditing ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-6">
            {/* Event Type and Dates Row */}
            {!isEditing && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-sm text-slate-600 font-medium flex-1">
                    <span className="font-semibold">Type:</span> {eventType && eventType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 font-medium text-center">
                    <span className="block text-xs text-slate-500 mb-1">Start</span>
                    {startDate && startDate.toLocaleDateString()}
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 font-medium text-center">
                    <span className="block text-xs text-slate-500 mb-1">End</span>
                    {endDate && endDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                autoFocus
                placeholder="Enter event title..."
                className="w-full rounded-lg border border-slate-300 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:ring-opacity-50 px-4 py-2 text-base bg-white placeholder-slate-400"
              />
            </div>
            {isEditing && (
              <>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
                    Event Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as EventType })}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                  >
                    <option value={EventType.PLANNED_LEAVE}>Planned Leave</option>
                    <option value={EventType.BUSY_PERIOD}>Busy Period</option>
                    <option value={EventType.SLOW_PERIOD}>Slow Period</option>
                    <option value={EventType.HOLIDAY}>Holiday</option>
                    <option value={EventType.OPTIONAL_HOLIDAY}>Optional Holiday</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      required
                      className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                  />
                </div>
              </>
            )}
          </div>
          <div className="mt-8 flex justify-end gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              {isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};