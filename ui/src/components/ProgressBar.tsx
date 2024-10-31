import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}