import React from 'react';
import { Calendar } from 'lucide-react';

interface WorkweekOptionProps {
  days: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function WorkweekOption({ days, isSelected, onSelect }: WorkweekOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative p-6 rounded-xl transition-all duration-300
        ${isSelected ? 'bg-indigo-100 shadow-lg scale-105' : 'bg-white hover:bg-gray-50'}
        flex flex-col items-center gap-3 group
      `}
    >
      <Calendar className={`w-8 h-8 ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`} />
      <div className="grid grid-cols-7 gap-1">
        {[...Array(7)].map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index < days
                ? isSelected
                  ? 'bg-indigo-600'
                  : 'bg-indigo-400'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <span className={`text-sm font-medium ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`}>
        {days}-Day Week
      </span>
      {isSelected && (
        <div className="absolute -inset-1 border-2 border-indigo-500 rounded-xl" />
      )}
    </button>
  );
}