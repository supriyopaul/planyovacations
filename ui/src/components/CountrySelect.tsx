import React from 'react';
import { Search } from 'lucide-react';

interface Country {
  code: string;
  name: string;
}

const POPULAR_COUNTRIES: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
];

interface CountrySelectProps {
  selectedCountry: string | null;
  onSelect: (country: Country) => void;
}

export function CountrySelect({ selectedCountry, onSelect }: CountrySelectProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const filteredCountries = POPULAR_COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCountryName = POPULAR_COUNTRIES.find(c => c.code === selectedCountry)?.name;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg 
          flex items-center justify-between bg-white hover:border-indigo-500 
          transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className="text-gray-700">
          {selectedCountryName || 'Select your country'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  onSelect(country);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-indigo-50 
                  ${selectedCountry === country.code ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'}`}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}