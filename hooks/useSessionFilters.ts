'use client';

import { useState, useMemo, useCallback } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';
import { SessionWithTask, SessionFilters, SessionSortOptions, SessionStatus } from '@/types';

export type DateRange = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

export interface UseSessionFiltersReturn {
  filters: SessionFilters;
  sortOptions: SessionSortOptions;
  dateRange: DateRange;
  setFilters: (filters: Partial<SessionFilters>) => void;
  setSortOptions: (options: SessionSortOptions) => void;
  setDateRange: (range: DateRange, customRange?: { start: Date; end: Date }) => void;
  updateFilter: <K extends keyof SessionFilters>(key: K, value: SessionFilters[K]) => void;
  clearFilters: () => void;
  appliedFiltersCount: number;
}

export function useSessionFilters(
  initialFilters: Partial<SessionFilters> = {},
  initialSort: SessionSortOptions = { sortBy: 'startTime', sortOrder: 'desc' }
): UseSessionFiltersReturn {
  // State
  const [filters, setFiltersState] = useState<SessionFilters>({
    ...initialFilters,
  });

  const [sortOptions, setSortOptions] = useState<SessionSortOptions>(initialSort);
  const [dateRange, setDateRangeState] = useState<DateRange>('all');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);

  // Computed values
  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.taskId) count++;
    if (filters.status) count++;
    if (filters.type) count++;
    if (dateRange !== 'all') count++;
    return count;
  }, [filters, dateRange]);

  // Helper function to get date range filter
  const getDateRangeFilter = useCallback((range: DateRange, custom?: { start: Date; end: Date }) => {
    const now = new Date();

    switch (range) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
      case 'yesterday':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        };
      case 'thisWeek':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }), // Monday start
          end: endOfWeek(now, { weekStartsOn: 1 })
        };
      case 'lastWeek':
        const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        return {
          start: lastWeekStart,
          end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
        };
      case 'thisMonth':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        };
      case 'custom':
        return custom || null;
      default:
        return null;
    }
  }, []);

  // Handlers
  const setFilters = useCallback((newFilters: Partial<SessionFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateFilter = useCallback(<K extends keyof SessionFilters>(
    key: K,
    value: SessionFilters[K]
  ) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
  }, []);

  const setDateRange = useCallback((range: DateRange, customRange?: { start: Date; end: Date }) => {
    setDateRangeState(range);

    if (range === 'custom' && customRange) {
      setCustomDateRange(customRange);
      setFiltersState(prev => ({ ...prev, dateRange: customRange }));
    } else {
      const dateRangeFilter = getDateRangeFilter(range);
      setCustomDateRange(null);
      setFiltersState(prev => ({ ...prev, dateRange: dateRangeFilter }));
    }
  }, [getDateRangeFilter]);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setDateRangeState('all');
    setCustomDateRange(null);
  }, []);

  return {
    filters,
    sortOptions,
    dateRange,
    setFilters,
    setSortOptions,
    setDateRange,
    updateFilter,
    clearFilters,
    appliedFiltersCount,
  };
}

// Helper hook for filtering sessions on the client side
export function useFilteredSessions(
  sessions: SessionWithTask[],
  filters: SessionFilters,
  sortOptions: SessionSortOptions
): SessionWithTask[] {
  return useMemo(() => {
    let filteredSessions = [...sessions];

    // Apply filters
    if (filters.dateRange) {
      filteredSessions = filteredSessions.filter(session => {
        const sessionDate = session.startTime;
        return sessionDate >= filters.dateRange!.start && sessionDate <= filters.dateRange!.end;
      });
    }

    if (filters.taskId) {
      filteredSessions = filteredSessions.filter(session => session.taskId === filters.taskId);
    }

    if (filters.status) {
      filteredSessions = filteredSessions.filter(session => session.status === filters.status);
    }

    if (filters.type) {
      filteredSessions = filteredSessions.filter(session => session.type === filters.type);
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

      const modifier = sortOptions.sortOrder === 'asc' ? 1 : -1;
      return aValue < bValue ? -modifier : aValue > bValue ? modifier : 0;
    });

    return filteredSessions;
  }, [sessions, filters, sortOptions]);
}