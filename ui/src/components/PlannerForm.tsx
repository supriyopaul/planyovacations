import React, { useState, useEffect } from 'react';
import { getSupportedCountries } from '../utils/api';

interface PlannerFormProps {
  onSubmit: (workWeek: number, startDate: string, leaveBalance: number, country: string) => void;
  onReset?: () => void;
  onLoadRecommendations?: () => void;
  leaveBalance: number;
  onLeaveBalanceChange: (newBalance: number) => void;
  loading: boolean;
  isCalendarLoaded?: boolean;
}

const PlannerForm: React.FC<PlannerFormProps> = ({
  onSubmit,
  onReset,
  onLoadRecommendations,
  leaveBalance,
  onLeaveBalanceChange,
  loading,
  isCalendarLoaded = false,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [workWeek, setWorkWeek] = useState(5);
  const [startDate, setStartDate] = useState(today);
  const [countries, setCountries] = useState<{ name: string; code: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('IN');

  useEffect(() => {
    getSupportedCountries()
      .then((data) => {
        setCountries(data);
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
    if (!isCalendarLoaded) {
      if (!selectedCountry) {
        alert('Please select a country');
        return;
      }
      onSubmit(workWeek, startDate, leaveBalance, selectedCountry);
    }
  };

  const buttonClasses = `inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;

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
        {isCalendarLoaded ? (
          <>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                disabled={loading}
                className={`${buttonClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500`}
              >
                Reset calendar
              </button>
            )}
            {onLoadRecommendations && (
              <button
                type="button"
                onClick={onLoadRecommendations}
                disabled={loading}
                className={`${buttonClasses} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 ml-4`}
              >
                Load recommendations
              </button>
            )}
          </>
        ) : (
          <button
            type="submit"
            disabled={loading || !selectedCountry}
            className={`${buttonClasses} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`}
          >
            {loading ? 'Calculating...' : 'Plan My Vacation'}
          </button>
        )}
      </div>
    </form>
  );
};

export default PlannerForm;
