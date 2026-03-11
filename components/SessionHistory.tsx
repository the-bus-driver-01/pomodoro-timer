'use client';

import React, { useState, useMemo } from 'react';
import { format, isToday, isYesterday, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { SessionWithTask, SessionFilters, SessionSortOptions, SessionListView, SessionStatus } from '@/types';
import { useSessions } from '@/hooks/useSessions';
import SessionHistoryItem from './SessionHistoryItem';

interface SessionHistoryProps {
  initialFilters?: Partial<SessionFilters>;
  initialSortOptions?: SessionSortOptions;
  initialView?: SessionListView;
  className?: string;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({
  initialFilters = {},
  initialSortOptions = { sortBy: 'startTime', sortOrder: 'desc' },
  initialView = 'list',
  className = '',
}) => {
  // State management
  const [filters, setFilters] = useState<SessionFilters>({
    ...initialFilters,
  });
  const [sortOptions, setSortOptions] = useState<SessionSortOptions>(initialSortOptions);
  const [view, setView] = useState<SessionListView>(initialView);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');

  // Hooks
  const { sessions, loading, error, refetch } = useSessions(filters);

  // Memoized filtered and sorted sessions
  const processedSessions = useMemo(() => {
    let filteredSessions = [...sessions];

    // Apply date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (selectedDateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          filteredSessions = filteredSessions.filter(session =>
            session.startTime >= startDate
          );
          break;
        case 'yesterday':
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          filteredSessions = filteredSessions.filter(session =>
            session.startTime >= startDate && session.startTime < endDate
          );
          break;
        case 'thisWeek':
          startDate = startOfWeek(now);
          filteredSessions = filteredSessions.filter(session =>
            session.startTime >= startDate
          );
          break;
        case 'lastWeek':
          const lastWeekStart = startOfWeek(subWeeks(now, 1));
          const lastWeekEnd = endOfWeek(subWeeks(now, 1));
          filteredSessions = filteredSessions.filter(session =>
            session.startTime >= lastWeekStart && session.startTime <= lastWeekEnd
          );
          break;
      }
    }

    // Apply sorting
    filteredSessions.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOptions.sortBy) {
        case 'startTime':
          aValue = a.startTime.getTime();
          bValue = b.startTime.getTime();
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.startTime.getTime();
          bValue = b.startTime.getTime();
      }

      if (sortOptions.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filteredSessions;
  }, [sessions, selectedDateRange, sortOptions]);

  // Group sessions by date for better organization
  const groupedSessions = useMemo(() => {
    const groups: { [date: string]: SessionWithTask[] } = {};

    processedSessions.forEach(session => {
      const dateKey = format(session.startTime, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });

    return groups;
  }, [processedSessions]);

  // Format date group headers
  const formatDateHeader = (dateString: string): string => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof SessionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
  };

  const handleSortChange = (sortBy: SessionSortOptions['sortBy']) => {
    setSortOptions(prev => ({
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Sessions</h3>
          <p className="text-red-700 mb-3">{error}</p>
          <button
            onClick={refetch}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (processedSessions.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <div className="text-gray-400 text-5xl mb-4">🍅</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Sessions Found</h3>
          <p className="text-gray-500">
            {sessions.length === 0
              ? "You haven't started any Pomodoro sessions yet."
              : "No sessions match your current filters."}
          </p>
          {sessions.length > 0 && (
            <button
              onClick={() => {
                setFilters({});
                setSelectedDateRange('all');
              }}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <main
      className={`flex flex-col h-full bg-white rounded-lg shadow-sm ${className}`}
      aria-label="Session History"
      role="main"
    >
      {/* Header */}
      <header className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">
            Session History ({processedSessions.length})
          </h1>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4" role="toolbar" aria-label="Session filters and sorting">
            {/* Date Range Filter */}
            <label htmlFor="date-range-filter" className="sr-only">Filter by date range</label>
            <select
              id="date-range-filter"
              value={selectedDateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-describedby="date-range-description"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
            </select>
            <div id="date-range-description" className="sr-only">
              Filter sessions by time period
            </div>

            {/* Sort Options */}
            <div className="flex gap-1" role="group" aria-label="Sort options">
              {(['startTime', 'duration', 'status'] as const).map((sortBy) => (
                <button
                  key={sortBy}
                  onClick={() => handleSortChange(sortBy)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    sortOptions.sortBy === sortBy
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={sortOptions.sortBy === sortBy}
                  aria-label={`Sort by ${sortBy === 'startTime' ? 'time' : sortBy} ${
                    sortOptions.sortBy === sortBy
                      ? `(currently ${sortOptions.sortOrder === 'desc' ? 'descending' : 'ascending'})`
                      : ''
                  }`}
                >
                  {sortBy === 'startTime' ? 'Time' :
                   sortBy === 'duration' ? 'Duration' : 'Status'}
                  {sortOptions.sortBy === sortBy && (
                    <span className="ml-1" aria-hidden="true">
                      {sortOptions.sortOrder === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Session List */}
      <div
        className="flex-1 overflow-y-auto scrollbar-thin"
        role="region"
        aria-label="Session list"
        tabIndex={0}
      >
        <div className="p-4 space-y-6">
          {Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <section key={date} className="space-y-3" aria-labelledby={`date-${date}`}>
              {/* Date Header */}
              <h2
                id={`date-${date}`}
                className="text-sm font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200 pb-2"
              >
                {formatDateHeader(date)}
              </h2>

              {/* Sessions for this date */}
              <div
                className={`space-y-2 ${
                  view === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : view === 'compact'
                    ? 'space-y-1'
                    : 'space-y-3'
                }`}
                role="list"
                aria-label={`${dateSessions.length} session${dateSessions.length !== 1 ? 's' : ''} on ${formatDateHeader(date)}`}
              >
                {dateSessions.map((session) => (
                  <div key={session.id} role="listitem">
                    <SessionHistoryItem
                      session={session}
                      view={view}
                      className={view === 'compact' ? 'py-2' : ''}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

export default SessionHistory;