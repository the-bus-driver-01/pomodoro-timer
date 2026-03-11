'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SessionWithTask, SessionFilters, PomodoroSession } from '@/types';
import { sessionStorage, mergeSessionsWithTasks } from '@/lib/sessionStorage';

export interface UseSessionsReturn {
  sessions: SessionWithTask[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addSession: (session: PomodoroSession) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<PomodoroSession>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  stats: {
    totalSessions: number;
    completedSessions: number;
    totalDuration: number;
    averageDuration: number;
  };
}

export function useSessions(filters?: SessionFilters): UseSessionsReturn {
  // State
  const [sessions, setSessions] = useState<SessionWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from storage
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rawSessions = await sessionStorage.getSessions();
      const sessionsWithTasks = await mergeSessionsWithTasks(rawSessions);

      setSessions(sessionsWithTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Add new session
  const addSession = useCallback(async (session: PomodoroSession) => {
    try {
      const newSession = await sessionStorage.addSession(session);
      const sessionsWithTasks = await mergeSessionsWithTasks([newSession]);
      const sessionWithTask = sessionsWithTasks[0];

      setSessions(prev => [sessionWithTask, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add session');
      throw err;
    }
  }, []);

  // Update existing session
  const updateSession = useCallback(async (sessionId: string, updates: Partial<PomodoroSession>) => {
    try {
      const updatedSession = await sessionStorage.updateSession(sessionId, updates);
      if (!updatedSession) {
        throw new Error('Session not found');
      }

      const sessionsWithTasks = await mergeSessionsWithTasks([updatedSession]);
      const sessionWithTask = sessionsWithTasks[0];

      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId ? sessionWithTask : session
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
      throw err;
    }
  }, []);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const success = await sessionStorage.deleteSession(sessionId);
      if (!success) {
        throw new Error('Session not found');
      }

      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      throw err;
    }
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalDuration,
      averageDuration: completedSessions.length > 0 ? Math.round(totalDuration / completedSessions.length) : 0,
    };
  }, [sessions]);

  // Apply client-side filters if provided
  const filteredSessions = useMemo(() => {
    if (!filters) return sessions;

    let filtered = [...sessions];

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(session => {
        const sessionDate = session.startTime;
        return sessionDate >= filters.dateRange!.start && sessionDate <= filters.dateRange!.end;
      });
    }

    // Task filter
    if (filters.taskId) {
      filtered = filtered.filter(session => session.taskId === filters.taskId);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(session => session.status === filters.status);
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(session => session.type === filters.type);
    }

    return filtered;
  }, [sessions, filters]);

  return {
    sessions: filteredSessions,
    loading,
    error,
    refetch: loadSessions,
    addSession,
    updateSession,
    deleteSession,
    stats,
  };
}

// Hook for getting a single session
export function useSession(sessionId: string) {
  const { sessions, loading, error } = useSessions();

  const session = useMemo(() => {
    return sessions.find(s => s.id === sessionId) || null;
  }, [sessions, sessionId]);

  return {
    session,
    loading,
    error,
  };
}

// Hook for real-time session updates (for in-progress sessions)
export function useActiveSession() {
  const { sessions, loading, error, updateSession } = useSessions();

  const activeSession = useMemo(() => {
    return sessions.find(s => s.status === 'in_progress') || null;
  }, [sessions]);

  // Update active session duration periodically
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const now = new Date();
      const duration = now.getTime() - activeSession.startTime.getTime();

      updateSession(activeSession.id, {
        duration,
        updatedAt: now,
      }).catch(console.error);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [activeSession, updateSession]);

  return {
    activeSession,
    loading,
    error,
  };
}