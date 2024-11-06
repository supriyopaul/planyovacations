import React, { useState, useEffect } from 'react';
import { getSupportedCountries } from '../utils/api'; // Import the API function

interface PlannerFormProps {
  onSubmit: (workWeek: number, startDate: string, leaveBalance: number, country: string) => void;
  leaveBalance: number;
  onLeaveBalanceChange: (newBalance: number) => void;
  loading: boolean;
}

const PlannerForm: React.FC<PlannerFormProps> = ({
  onSubmit,
  leaveBalance,
  onLeaveBalanceChange,
  loading,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [workWeek, setWorkWeek] = useState(5);
  const [startDate, setStartDate] = useState(today);
  const [countries, setCountries] = useState<{ name: string; code: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('IN');

  useEffect(() => {
    // Fetch supported countries when the component mounts
    getSupportedCountries()
      .then((data) => {
        setCountries(data);
        // If India exists in the list, keep it selected, otherwise select first country
        if (!data.some(country => country.code === 'IN')) {
          setSelectedCountry(data[0]?.code || '');
        }
      })
      .catch((error) => {
        console.error('Failed to fetch supported countries:', error);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) {
      alert('Please select a country');
      return;
    }
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
            onChange={(e) => {
              const newLeaveBalance = Number(e.target.value);
              onLeaveBalanceChange(newLeaveBalance);
            }}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading || !selectedCountry}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Calculating...' : 'Plan My Vacation'}
        </button>
      </div>
    </form>
  );
};

export default PlannerForm;
