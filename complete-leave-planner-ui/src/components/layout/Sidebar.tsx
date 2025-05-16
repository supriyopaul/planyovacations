import React from 'react';
import {
  CalendarIcon,
  PlusIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store/appStore';
import { useCalendarStore } from '../../store/calendarStore';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

interface SidebarItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

function SidebarItem({ icon: Icon, label, onClick, isActive }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="truncate">{label}</span>
    </button>
  );
}

export function Sidebar() {
  const { sidebarExpanded, toggleSidebar, setActiveModal } = useAppStore();
  const { settings } = useCalendarStore();

  const primaryActions = [
    {
      icon: PlusIcon,
      label: 'Add Planned Leave',
      onClick: () => setActiveModal('add-leave'),
    },
    {
      icon: ClockIcon,
      label: 'Mark Busy Period',
      onClick: () => setActiveModal('add-busy'),
    },
    {
      icon: ChartBarIcon,
      label: 'Mark Slow Period',
      onClick: () => setActiveModal('add-slow'),
    },
    {
      icon: ArrowPathIcon,
      label: 'Suggest Leave',
      onClick: () => setActiveModal('suggestions'),
    },
  ];

  const secondaryActions = [
    {
      icon: ArrowDownTrayIcon,
      label: 'Export Data',
      onClick: () => setActiveModal('export'),
    },
    {
      icon: ArrowUpTrayIcon,
      label: 'Import Data',
      onClick: () => setActiveModal('import'),
    },
    {
      icon: Cog6ToothIcon,
      label: 'Settings',
      onClick: () => setActiveModal('settings'),
    },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white shadow-lg transition-all duration-300',
        sidebarExpanded ? 'w-sidebar' : 'w-sidebar-collapsed'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary-500" />
            {sidebarExpanded && (
              <span className="text-lg font-semibold text-slate-900">
                Leave Planner
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            <span className="sr-only">
              {sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            </span>
            <svg
              className={cn(
                'h-5 w-5 transform transition-transform',
                sidebarExpanded ? 'rotate-180' : ''
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>

        {/* Leave Balance */}
        <div className="border-t border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Leave Balance</span>
            {sidebarExpanded && (
              <span className="text-sm font-semibold text-primary-600">
                {settings.leaveBalance.remaining} days
              </span>
            )}
          </div>
        </div>

        {/* Primary Actions */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {primaryActions.map((action) => (
            <SidebarItem
              key={action.label}
              icon={action.icon}
              label={action.label}
              onClick={action.onClick}
            />
          ))}
        </nav>

        {/* Secondary Actions */}
        <nav className="border-t border-slate-200 px-2 py-4">
          {secondaryActions.map((action) => (
            <SidebarItem
              key={action.label}
              icon={action.icon}
              label={action.label}
              onClick={action.onClick}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
} 