import React, { useState, useEffect } from 'react';
import { getSupportedCountries } from '../utils/api'; // Import the API function

interface PlannerFormProps {
  onSubmit: (workWeek: number, startDate: string, leaveBalance: number, country: string) => void;
  loading: boolean;
}

const PlannerForm: React.FC<PlannerFormProps> = ({ onSubmit, loading }) => {
  const today = new Date().toISOString().split('T')[0];
  const [workWeek, setWorkWeek] = useState(5);
  const [startDate, setStartDate] = useState(today);
  const [leaveBalance, setLeaveBalance] = useState(18);
  const [countries, setCountries] = useState<{ name: string; code: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    // Fetch supported countries when the component mounts
    getSupportedCountries()
      .then((data) => {
        const initialOption = { name: 'Do not load public holidays', code: '' };
        setCountries([initialOption, ...data]);
      })
      .catch((error) => {
        console.error('Failed to fetch supported countries:', error);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(workWeek, startDate, leaveBalance, selectedCountry);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <div>
          <label htmlFor="workWeek" className="block text-sm font-medium text-gray-700 mb-2">
            Work Days per Week
          </label>
          <input
            type="number"
            id="workWeek"
            value={workWeek}
            onChange={(e) => setWorkWeek(Number(e.target.value))}
            min="4"
            max="6"
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
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {countries.map((country, index) => (
              <option key={index} value={country.code}>
                {country.name} {country.code ? `(${country.code})` : ''}
              </option>
            ))}
          </select>
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
