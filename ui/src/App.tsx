import React, { useState } from 'react';
import { Calendar } from './components/Calendar/Calendar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { LeaveProvider } from './context/LeaveContext';
import './index.css';
import { EventType } from './types';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [offDays, setOffDays] = useState<number[]>([0, 6]);
  const [selectedBrush, setSelectedBrush] = useState<EventType | null>(null);

  return (
    <LeaveProvider>
      <div className="flex h-screen bg-slate-50 text-slate-800">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          setOffDays={setOffDays}
          selectedBrush={selectedBrush}
          setSelectedBrush={setSelectedBrush}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <Calendar offDays={offDays} selectedBrush={selectedBrush} setSelectedBrush={setSelectedBrush} />
        </main>
      </div>
    </LeaveProvider>
  );
}

export default App;