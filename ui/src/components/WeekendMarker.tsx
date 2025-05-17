import React, { useState, useEffect } from 'react';

// Start from Monday, Sunday last
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayIndexes = [1, 2, 3, 4, 5, 6, 0];

export const WeekendMarker = ({ onChange }: { onChange?: (offDays: number[]) => void }) => {
  // By default, Sat (6) and Sun (0) are off
  const [offDays, setOffDays] = useState<number[]>([6, 0]);

  useEffect(() => {
    if (onChange) onChange(offDays);
  }, [offDays, onChange]);

  const handleDayToggle = (idx: number) => {
    setOffDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  };

  return (
    <div>
      <label className="block text-xs text-slate-600 mb-1 font-semibold">Select Week Off Days</label>
      <div className="flex gap-2 flex-wrap">
        {dayLabels.map((label, i) => (
          <label key={label} className="flex items-center gap-1 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={offDays.includes(dayIndexes[i])}
              onChange={() => handleDayToggle(dayIndexes[i])}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}; 