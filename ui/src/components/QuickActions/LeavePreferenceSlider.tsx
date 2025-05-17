import React, { useState } from 'react';

export const LeavePreferenceSlider: React.FC = () => {
  const [preferences, setPreferences] = useState({
    leaveLength: 50, // 0 = short breaks, 100 = long vacations
    frequency: 50,   // 0 = many small breaks, 100 = few large breaks
    proximity: 50    // 0 = spread out, 100 = clustered
  });
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof preferences) => {
    setPreferences({
      ...preferences,
      [type]: parseInt(e.target.value, 10)
    });
  };
  
  const getLeaveText = () => {
    if (preferences.leaveLength < 33) return 'Short breaks';
    if (preferences.leaveLength < 66) return 'Mixed durations';
    return 'Long vacations';
  };
  
  const getFrequencyText = () => {
    if (preferences.frequency < 33) return 'Many small breaks';
    if (preferences.frequency < 66) return 'Balanced';
    return 'Few longer breaks';
  };
  
  const getProximityText = () => {
    if (preferences.proximity < 33) return 'Spread throughout year';
    if (preferences.proximity < 66) return 'Somewhat clustered';
    return 'Clustered together';
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Short breaks</span>
          <span>{getLeaveText()}</span>
          <span>Long vacations</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={preferences.leaveLength}
          onChange={(e) => handleSliderChange(e, 'leaveLength')}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />
      </div>
      
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Many breaks</span>
          <span>{getFrequencyText()}</span>
          <span>Few breaks</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={preferences.frequency}
          onChange={(e) => handleSliderChange(e, 'frequency')}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />
      </div>
      
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Spread out</span>
          <span>{getProximityText()}</span>
          <span>Clustered</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={preferences.proximity}
          onChange={(e) => handleSliderChange(e, 'proximity')}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />
      </div>
    </div>
  );
};