import React, { useState } from 'react';

interface PlannerFormProps {
  onSubmit: (workWeek: number, startDate: string, leaveBalance: number) => void;
  loading: boolean;
}

const PlannerForm: React.FC<PlannerFormProps> = ({ onSubmit, loading }) => {
  const today = new Date().toISOString().split('T')[0];
  const [workWeek, setWorkWeek] = useState(5);
  const [startDate, setStartDate] = useState(today);
  const [leaveBalance, setLeaveBalance] = useState(18);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(workWeek, startDate, leaveBalance);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="workWeek" className="block text-sm font-medium text-gray-700 mb-2">
            Work Days per Week
          </label>
          <input
            type="number"
            id="workWeek"
            value={workWeek}
            onChange={(e) => setWorkWeek(Number(e.target.value))}
            min="1"
            max="7"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="leaveBalance" className="block text-sm font-medium text-gray-700 mb-2">
            Leave Balance (days)
          </label>
          <input
            type="number"
            id="leaveBalance"
            value={leaveBalance}
            onChange={(e) => setLeaveBalance(Number(e.target.value))}
            min="0"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Calculating...' : 'Plan My Vacation'}
        </button>
      </div>
    </form>
  );
};

export default PlannerForm;