import React, { useState } from 'react';
import { PreferencesSetup } from './components/PreferencesSetup';
import { HolidaySetup } from './components/HolidaySetup';
import { CalendarView } from './components/Calendar/CalendarView';

type Step = 'welcome' | 'preferences' | 'holidays' | 'calendar';

interface Preferences {
  workweek: number;
  leaveBalance: number;
}

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [preferences, setPreferences] = useState<Preferences>({
    workweek: 5,
    leaveBalance: 20
  });

  const handleContinue = (countryCode: string) => {
    setCurrentStep('calendar');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {currentStep === 'welcome' && (
        <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-800 relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
          
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
              Welcome to the ultimate Vacation Optimizer!
            </h1>
            <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
              Let's make the most of your time off.
            </p>
            
            <button 
              onClick={() => setCurrentStep('preferences')}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-8 py-4 rounded-full
                text-lg font-semibold transform transition-all duration-200 hover:scale-105
                hover:shadow-xl hover:from-emerald-500 hover:to-teal-600
                animate-[pulse_2s_ease-in-out_infinite] hover:animate-none
                shadow-lg"
            >
              Plan My Year
            </button>
          </div>
        </div>
      )}
      
      {currentStep === 'preferences' && (
        <div className="min-h-screen py-12">
          <PreferencesSetup onComplete={(prefs) => {
            setPreferences(prefs);
            setCurrentStep('holidays');
          }} />
        </div>
      )}

      {currentStep === 'holidays' && (
        <div className="min-h-screen py-12">
          <HolidaySetup onContinue={handleContinue} />
        </div>
      )}

      {currentStep === 'calendar' && (
        <CalendarView
          workWeek={preferences.workweek}
          leaveBalance={preferences.leaveBalance}
        />
      )}
    </div>
  );
}

export default App;