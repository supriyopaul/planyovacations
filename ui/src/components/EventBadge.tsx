import React from 'react';
import { LeaveEvent, EventType } from '../types';

interface EventBadgeProps {
  event: LeaveEvent;
  onDragStart?: (e: React.DragEvent) => void;
}

export const EventBadge: React.FC<EventBadgeProps> = ({ event, onDragStart }) => {
  // Map event types to Tailwind classes for badge styling
  const getBadgeClasses = () => {
    switch (event.type) {
      case EventType.HOLIDAY:
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case EventType.OPTIONAL_HOLIDAY:
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case EventType.PLANNED_LEAVE:
        return 'bg-teal-100 text-teal-700 border-teal-300';
      case EventType.BUSY_PERIOD:
        return 'bg-red-100 text-red-700 border-red-300';
      case EventType.SLOW_PERIOD:
        return 'bg-green-100 text-green-700 border-green-300';
      case EventType.SUGGESTED_LEAVE:
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div 
      className={`text-xs px-2 py-1 rounded border cursor-pointer truncate ${getBadgeClasses()}`}
      draggable={event.type === EventType.PLANNED_LEAVE}
      onDragStart={onDragStart}
      title={`${event.title}${event.description ? ` - ${event.description}` : ''}`}
    >
      {event.title}
    </div>
  );
};