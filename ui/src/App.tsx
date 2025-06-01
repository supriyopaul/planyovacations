import React, { useState } from 'react';
import { Calendar } from './components/Calendar/Calendar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { LeaveProvider, useLeave } from './context/LeaveContext';
import './index.css';
import { EventType } from './types';

function CalendarApp() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedBrush, setSelectedBrush] = useState<EventType | null>(null);
  const { offDays, setOffDays } = useLeave();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        setOffDays={setOffDays}
        selectedBrush={selectedBrush}
        setSelectedBrush={setSelectedBrush}
      />
      
      <main className="flex-1 overflow-auto">
        <Calendar offDays={offDays} selectedBrush={selectedBrush} setSelectedBrush={setSelectedBrush} />
      </main>
    </div>
  );
}

function App() {
  return (
    <LeaveProvider>
      <CalendarApp />
    </LeaveProvider>
  );
}

export default App;