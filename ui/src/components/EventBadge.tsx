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
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case EventType.OPTIONAL_HOLIDAY:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case EventType.PLANNED_LEAVE:
        return 'bg-teal-100 text-teal-700 border-teal-300';
      case EventType.BUSY_PERIOD:
        return 'bg-red-100 text-red-700 border-red-300';
      case EventType.SLOW_PERIOD:
        return 'bg-orange-100 text-orange-700 border-orange-300';
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