import React, { useState } from 'react';
import { MapPin, Globe } from 'lucide-react';
import { CountrySelect } from './CountrySelect';
import { ProgressBar } from './ProgressBar';

interface HolidaySetupProps {
  onContinue: (countryCode: string) => void;
}

export function HolidaySetup({ onContinue }: HolidaySetupProps) {
  const [locationType, setLocationType] = useState<'auto' | 'manual'>('auto');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAutoDetect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // For demo purposes, we'll just set US as the country
      // In a real app, you'd use a geocoding service here
      setSelectedCountry('US');
    } catch (err) {
      setError('Unable to detect location. Please select your country manually.');
      setLocationType('manual');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedCountry) {
      onContinue(selectedCountry);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Import Public Holidays</h2>
        <p className="text-gray-600">Let's add your region's holidays to optimize your vacation planning</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLocationType('auto')}
              className={`p-6 rounded-xl border-2 transition-all duration-200
                ${locationType === 'auto' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-indigo-200'}`}
            >
              <MapPin className={`w-6 h-6 mb-2 ${locationType === 'auto' ? 'text-indigo-500' : 'text-gray-400'}`} />
              <div className={`font-medium ${locationType === 'auto' ? 'text-indigo-700' : 'text-gray-700'}`}>
                Auto-detect my location
              </div>
            </button>

            <button
              onClick={() => setLocationType('manual')}
              className={`p-6 rounded-xl border-2 transition-all duration-200
                ${locationType === 'manual' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-indigo-200'}`}
            >
              <Globe className={`w-6 h-6 mb-2 ${locationType === 'manual' ? 'text-indigo-500' : 'text-gray-400'}`} />
              <div className={`font-medium ${locationType === 'manual' ? 'text-indigo-700' : 'text-gray-700'}`}>
                Choose manually
              </div>
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {locationType === 'manual' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select your country
              </label>
              <CountrySelect
                selectedCountry={selectedCountry}
                onSelect={(country) => setSelectedCountry(country.code)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <ProgressBar progress={66} />
        <button
          onClick={locationType === 'auto' ? handleAutoDetect : handleContinue}
          disabled={locationType === 'manual' && !selectedCountry}
          className={`w-full py-3 px-6 rounded-lg text-white font-medium 
            transition-all duration-300 relative
            ${(!selectedCountry && locationType === 'manual') || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Detecting Location...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
}