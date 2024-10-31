import React, { useState } from 'react';
import { X } from 'lucide-react';

const TIPS = [
  {
    title: 'Navigate Through Months',
    description: 'Scroll vertically to view different months of the year.',
  },
  {
    title: 'Understanding Colors',
    description: 'Blue dots indicate public holidays, green backgrounds show your planned leaves.',
  },
  {
    title: 'Plan Your Leaves',
    description: 'Tap on any date to plan a leave. We\'ll help optimize your time off!',
  },
];

export function Tutorial() {
  const [currentTip, setCurrentTip] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl p-4 z-50">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">{TIPS[currentTip].title}</h4>
        <p className="text-sm text-gray-600">{TIPS[currentTip].description}</p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1">
            {TIPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentTip ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => {
              if (currentTip === TIPS.length - 1) {
                setIsVisible(false);
              } else {
                setCurrentTip(prev => prev + 1);
              }
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {currentTip === TIPS.length - 1 ? 'Got it!' : 'Next tip'}
          </button>
        </div>
      </div>
    </div>
  );
}