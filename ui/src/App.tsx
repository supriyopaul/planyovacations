import React, { useState } from 'react';
import { Calendar } from './components/Calendar/Calendar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { LeaveProvider } from './context/LeaveContext';
import './index.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <LeaveProvider>
      <div className="flex h-screen bg-slate-50 text-slate-800">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <Calendar />
        </main>
      </div>
    </LeaveProvider>
  );
}

export default App;