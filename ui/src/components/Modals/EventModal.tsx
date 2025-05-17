import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useLeave } from '../../context/LeaveContext';
import { EventType } from '../../types';

export const EventModal: React.FC = () => {
  const { 
    activeEventId,
    setIsCreatingEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    events,
    setActiveEventId
  } = useLeave();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: EventType.PLANNED_LEAVE
  });
  
  // If editing an existing event, populate form data
  useEffect(() => {
    if (activeEventId) {
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
    }
  }, [activeEventId, events]);
  
  const handleClose = () => {
    setIsCreatingEvent(false);
    setActiveEventId(null);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      title: formData.title,
      description: formData.description,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      type: formData.type as EventType
    };
    
    if (activeEventId) {
      updateEvent(activeEventId, eventData);
    } else {
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
  
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-300">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar size={18} className="text-teal-500" />
            {activeEventId ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
                Event Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
              >
                <option value={EventType.PLANNED_LEAVE}>Planned Leave</option>
                <option value={EventType.BUSY_PERIOD}>Busy Period</option>
                <option value={EventType.SLOW_PERIOD}>Slow Period</option>
                <option value={EventType.HOLIDAY}>Holiday</option>
                <option value={EventType.OPTIONAL_HOLIDAY}>Optional Holiday</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
              />
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            {activeEventId && (
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
              {activeEventId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};