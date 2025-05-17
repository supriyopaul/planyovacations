import React from 'react';
import { useLeave } from '../../context/LeaveContext';

interface LeaveBalanceProps {
  isCollapsed: boolean;
}

export const LeaveBalance: React.FC<LeaveBalanceProps> = ({ isCollapsed }) => {
  const { leaveBalance } = useLeave();
  const { total, used, planned, remaining } = leaveBalance;
  
  // Calculate percentage for progress bar
  const usedPercentage = (used / total) * 100;
  const plannedPercentage = (planned / total) * 100;
  
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold text-teal-500">{remaining}</span>
        <span className="text-xs text-slate-500">days left</span>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-600 mb-2">Leave Balance</h3>
      
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
        <div 
          className="h-full bg-slate-400" 
          style={{ width: `${usedPercentage}%` }} 
        />
        <div 
          className="h-full bg-teal-400 -mt-2" 
          style={{ width: `${plannedPercentage}%` }} 
        />
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <span className="block text-sm font-semibold">{total}</span>
          <span className="text-xs text-slate-500">Total</span>
        </div>
        <div>
          <span className="block text-sm font-semibold">{used}</span>
          <span className="text-xs text-slate-500">Used</span>
        </div>
        <div>
          <span className="block text-sm font-semibold">{planned}</span>
          <span className="text-xs text-slate-500">Planned</span>
        </div>
        <div>
          <span className="block text-sm font-semibold text-teal-500">{remaining}</span>
          <span className="text-xs text-slate-500">Left</span>
        </div>
      </div>
    </div>
  );
};