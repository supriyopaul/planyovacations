import React, { useState } from 'react';

interface DateActionFormProps {
  date: string;
  onSubmit: (
    date: string, 
    name: string, 
    type: 'holiday' | 'leave' | 'preferred' | 'unpreferred', 
    endDate?: string
  ) => void;
  onCancel: () => void;
}

const DateActionForm: React.FC<DateActionFormProps> = ({ date, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'holiday' | 'leave' | 'preferred' | 'unpreferred'>('holiday');
  const [endDate, setEndDate] = useState(date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reason = type === 'preferred' ? 'Preferred Period' : 
                  type === 'unpreferred' ? 'Preferred Work Period' : 
                  name.trim();
    if (reason) {
      onSubmit(date, reason, type, ['leave', 'preferred', 'unpreferred'].includes(type) ? endDate : undefined);
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Add {
            type === 'holiday' ? 'Public Holiday' : 
            type === 'leave' ? 'Planned Leave' :
            type === 'preferred' ? 'Preferred Period' : 
            'Preferred Work Period'
          } for {new Date(date).toLocaleDateString()}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={type === 'holiday'}
                onChange={() => setType('holiday')}
                className="mr-2"
              />
              Public Holiday
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={type === 'leave'}
                onChange={() => setType('leave')}
                className="mr-2"
              />
              Planned Leave
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={type === 'preferred'}
                onChange={() => setType('preferred')}
                className="mr-2"
              />
              Preferred Period
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={type === 'unpreferred'}
                onChange={() => setType('unpreferred')}
                className="mr-2"
              />
              Preferred Work Period
            </label>
          </div>
          
          {['leave', 'preferred', 'unpreferred'].includes(type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={date}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          )}

          {['holiday', 'leave'].includes(type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === 'holiday' ? 'Holiday Name' : 'Leave Reason'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder={type === 'holiday' ? 'e.g., Christmas Day' : 'e.g., Family Vacation'}
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DateActionForm;