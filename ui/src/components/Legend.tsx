interface LegendItem {
  color: string;
  label: string;
}

const Legend: React.FC = () => {
  const items: LegendItem[] = [
    { color: 'bg-gray-100', label: 'Week Off' },
    { color: 'bg-purple-100', label: 'Public Holiday' },
    { color: 'bg-green-100', label: 'Planned Leave' },
    { color: 'bg-blue-100', label: 'Recommended Leave' },
    { color: 'bg-yellow-100', label: 'Preferred Vacation Period' },
    { color: 'bg-red-100', label: 'Preffered Work Period' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Calendar Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center">
            <div className={`w-6 h-6 rounded-full ${item.color} mr-2 border border-gray-200`}></div>
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
