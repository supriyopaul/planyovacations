import React from 'react';

interface LegendItem {
  type: 'fill' | 'text' | 'border';
  color: string;
  label: string;
  content?: string;
}

const Legend: React.FC = () => {
  const items: LegendItem[] = [
    { type: 'fill', color: 'bg-green-50', label: 'Week Off' },
    { type: 'text', color: 'text-green-700 font-bold', label: 'Holiday', content: 'H' },
    { type: 'text', color: 'text-green-700 font-bold', label: 'Leave (L)', content: 'L' },
    { type: 'text', color: 'text-green-700 font-bold', label: 'Recommended Leave', content: 'R' },
    { type: 'border', color: 'border-2 border-green-500', label: 'Preferred Vacation Period' },
    { type: 'border', color: 'border-2 border-red-500', label: 'Preferred Work Period' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Calendar Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center">
            {item.type === 'text' ? (
              <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 border border-gray-200 bg-green-50">
                <span className={item.color}>{item.content}</span>
              </div>
            ) : (
              <div className={`w-6 h-6 rounded-full mr-2 ${item.color}`}></div>
            )}
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
