import React, { useState } from 'react';
import { WorkweekOption } from './WorkweekOption';
import { ProgressBar } from './ProgressBar';

interface PreferencesSetupProps {
  onComplete: (preferences: { workweek: number; leaveBalance: number }) => void;
}

export function PreferencesSetup({ onComplete }: PreferencesSetupProps) {
  const [selectedWorkweek, setSelectedWorkweek] = useState<number>(5);
  const [leaveBalance, setLeaveBalance] = useState<string>('20');
  const [isValid, setIsValid] = useState<boolean>(true);

  const handleLeaveBalanceChange = (value: string) => {
    const numValue = parseInt(value);
    setLeaveBalance(value);
    setIsValid(numValue > 0 && numValue <= 365);
  };

  const canContinue = isValid && leaveBalance !== '' && selectedWorkweek > 0;

  const handleContinue = () => {
    if (canContinue) {
      onComplete({
        workweek: selectedWorkweek,
        leaveBalance: parseInt(leaveBalance, 10)
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Customize Your Work Schedule</h2>
        <p className="text-gray-600">Let's set up your preferences for optimal vacation planning</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">
            Select your typical workweek
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[4, 5, 6].map((days) => (
              <WorkweekOption
                key={days}
                days={days}
                isSelected={selectedWorkweek === days}
                onSelect={() => setSelectedWorkweek(days)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">
            How many planned leaves can you have this year?
          </label>
          <input
            type="number"
            value={leaveBalance}
            onChange={(e) => handleLeaveBalanceChange(e.target.value)}
            className={`w-full px-4 py-3 text-lg rounded-lg border ${
              isValid ? 'border-gray-300' : 'border-red-500'
            } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
            placeholder="Enter number of days"
            min="1"
            max="365"
          />
          {!isValid && (
            <p className="text-red-500 text-sm">Please enter a valid number of days (1-365)</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <ProgressBar progress={33} />
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-300 ${
            canContinue
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}