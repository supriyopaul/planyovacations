import React from 'react';
import { useLeave } from '../../context/LeaveContext';
import { LeaveStyle } from '../../types';

const styleOptions: { value: number; label: string; style: LeaveStyle }[] = [
  { value: 0, label: 'Shorter frequent breaks', style: 'short' },
  { value: 1, label: 'Mixed duration breaks', style: 'mixed' },
  { value: 2, label: 'Longer vacations', style: 'long' },
];

export const LeavePreferenceSlider: React.FC = () => {
  const { leaveStylePreferences, setLeaveStylePreferences } = useLeave();
  const currentValue = styleOptions.find(opt => opt.style === leaveStylePreferences.style)?.value ?? 1;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const selected = styleOptions[val] || styleOptions[1];
    setLeaveStylePreferences({ style: selected.style });
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="range"
        min={0}
        max={2}
        step={1}
        value={currentValue}
        onChange={handleSliderChange}
        className="w-full accent-purple-500"
        aria-label="Leave style preference"
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        {styleOptions.map(opt => (
          <span key={opt.value} className={currentValue === opt.value ? 'font-semibold text-purple-700' : ''}>{opt.label}</span>
        ))}
      </div>
      <div className="text-center text-sm text-slate-700 mt-2 font-medium">
        {styleOptions[currentValue].label}
      </div>
    </div>
  );
};