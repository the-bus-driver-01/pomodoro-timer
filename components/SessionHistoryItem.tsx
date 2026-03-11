'use client';

import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { SessionWithTask, SessionStatus, SessionListView } from '@/types';
import clsx from 'clsx';

interface SessionHistoryItemProps {
  session: SessionWithTask;
  view?: SessionListView;
  className?: string;
  onClick?: (session: SessionWithTask) => void;
  showDate?: boolean;
}

const SessionHistoryItem: React.FC<SessionHistoryItemProps> = ({
  session,
  view = 'list',
  className = '',
  onClick,
  showDate = false,
}) => {
  // Format duration in a human-readable way
  const formatDuration = (durationMs: number): string => {
    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    if (minutes === 0) {
      return `${seconds}s`;
    }
    if (seconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Get status color classes
  const getStatusStyles = (status: SessionStatus) => {
    const styles = {
      [SessionStatus.COMPLETED]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: '✓',
      },
      [SessionStatus.INTERRUPTED]: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-200',
        icon: '⏸',
      },
      [SessionStatus.IN_PROGRESS]: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        icon: '▶',
      },
      [SessionStatus.PLANNED]: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        icon: '⏰',
      },
    };
    return styles[status] || styles[SessionStatus.PLANNED];
  };

  // Get session type color and icon
  const getTypeStyles = (type: string) => {
    const styles = {
      work: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '🍅',
      },
      short_break: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '☕',
      },
      long_break: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: '🛌',
      },
    };
    return styles[type as keyof typeof styles] || styles.work;
  };

  const statusStyles = getStatusStyles(session.status);
  const typeStyles = getTypeStyles(session.type);

  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick(session);
    }
  };

  // Compact view for minimal space usage
  if (view === 'compact') {
    return (
      <div
        className={clsx(
          'flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors',
          className
        )}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Type icon */}
          <span className="text-lg flex-shrink-0">{typeStyles.icon}</span>

          {/* Task name or fallback */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.task?.name || 'Untitled Session'}
            </p>
          </div>

          {/* Duration */}
          <div className="text-xs text-gray-500 flex-shrink-0">
            {formatDuration(session.duration)}
          </div>

          {/* Status */}
          <div className={clsx(
            'w-2 h-2 rounded-full flex-shrink-0',
            statusStyles.bg.replace('bg-', 'bg-').replace('-100', '-400')
          )} />
        </div>

        {/* Time */}
        <div className="text-xs text-gray-400 ml-3 flex-shrink-0">
          {format(session.startTime, 'HH:mm')}
        </div>
      </div>
    );
  }

  // Grid view for card-like display
  if (view === 'grid') {
    return (
      <div
        className={clsx(
          'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer',
          className
        )}
        onClick={handleClick}
      >
        {/* Header with type and status */}
        <div className="flex items-center justify-between mb-3">
          <div className={clsx(
            'flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium',
            typeStyles.bg,
            typeStyles.text,
            typeStyles.border,
            'border'
          )}>
            <span>{typeStyles.icon}</span>
            <span className="capitalize">{session.type.replace('_', ' ')}</span>
          </div>

          <div className={clsx(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            statusStyles.bg,
            statusStyles.text,
            statusStyles.border,
            'border'
          )}>
            <span>{statusStyles.icon}</span>
            <span className="capitalize">{session.status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Task name */}
        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {session.task?.name || 'Untitled Session'}
        </h4>

        {/* Task description if available */}
        {session.task?.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {session.task.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span>⏱</span>
            <span>{formatDuration(session.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🕐</span>
            <span>{format(session.startTime, 'HH:mm')}</span>
          </div>
        </div>

        {showDate && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {format(session.startTime, 'MMM d, yyyy')}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default list view
  return (
    <article
      className={clsx(
        'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${session.task?.name || 'Untitled Session'} session - ${formatDuration(session.duration)}, ${session.status}`}
    >
      <div className="flex items-start justify-between">
        {/* Main content */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Type icon */}
          <div
            className={clsx(
              'flex items-center justify-center w-10 h-10 rounded-full text-lg flex-shrink-0',
              typeStyles.bg,
              typeStyles.border,
              'border'
            )}
            aria-label={`${session.type.replace('_', ' ')} session`}
            role="img"
          >
            {typeStyles.icon}
          </div>

          {/* Session details */}
          <div className="min-w-0 flex-1">
            {/* Task name and type */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {session.task?.name || 'Untitled Session'}
              </h3>
              <span
                className={clsx(
                  'px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                  typeStyles.bg,
                  typeStyles.text,
                  typeStyles.border,
                  'border'
                )}
                aria-label={`Session type: ${session.type.replace('_', ' ')}`}
              >
                {session.type.replace('_', ' ')}
              </span>
            </div>

            {/* Task description */}
            {session.task?.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                {session.task.description}
              </p>
            )}

            {/* Session metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>⏱</span>
                <span>{formatDuration(session.duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🕐</span>
                <span>{format(session.startTime, 'HH:mm')}</span>
                {session.endTime && (
                  <>
                    <span>-</span>
                    <span>{format(session.endTime, 'HH:mm')}</span>
                  </>
                )}
              </div>
              {showDate && (
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{format(session.startTime, 'MMM d')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className={clsx(
          'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 ml-4',
          statusStyles.bg,
          statusStyles.text,
          statusStyles.border,
          'border'
        )}>
          <span>{statusStyles.icon}</span>
          <span className="capitalize">{session.status.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Progress indicator for in-progress sessions */}
      {session.status === SessionStatus.IN_PROGRESS && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Session in progress...</span>
            <span className="text-gray-500">
              Started {formatDistanceToNow(session.startTime, { addSuffix: true })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHistoryItem;