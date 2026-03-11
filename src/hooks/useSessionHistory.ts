/**
 * React hook for session history management
 */

import { useState, useCallback, useEffect } from 'react';
import { SessionRecord, SessionType, SessionHistoryFilter } from '../types/session';
import {
  addSessionRecord,
  getSessionHistory as getStoredSessionHistory,
  clearSessionHistory as clearStoredSessionHistory,
  isStorageAvailable
} from '../services/sessionHistoryService';

/**
 * Custom hook for managing session history
 */
export function useSessionHistory() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isStorageAvailable_] = useState(() => isStorageAvailable());

  /**
   * Load session history from localStorage
   */
  const loadHistory = useCallback(() => {
    if (!isStorageAvailable_) {
      console.warn('localStorage is not available. Session history will not persist.');
      return;
    }

    try {
      const storedSessions = getStoredSessionHistory();
      setSessions(storedSessions);
    } catch (error) {
      console.error('Failed to load session history:', error);
      setSessions([]);
    }
  }, [isStorageAvailable_]);

  /**
   * Add a new session to the history
   */
  const addSession = useCallback((type: SessionType, duration: number) => {
    if (!isStorageAvailable_) {
      console.warn('localStorage is not available. Session will not be saved.');
      return;
    }

    try {
      // Add to localStorage
      addSessionRecord(type, duration);

      // Refresh local state
      loadHistory();
    } catch (error) {
      console.error('Failed to add session:', error);
    }
  }, [isStorageAvailable_, loadHistory]);

  /**
   * Get session history with optional filtering
   */
  const getHistory = useCallback((filter?: SessionHistoryFilter): SessionRecord[] => {
    if (!isStorageAvailable_) {
      return [];
    }

    try {
      return getStoredSessionHistory(filter);
    } catch (error) {
      console.error('Failed to get session history:', error);
      return [];
    }
  }, [isStorageAvailable_]);

  /**
   * Clear all session history
   */
  const clearHistory = useCallback(() => {
    if (!isStorageAvailable_) {
      console.warn('localStorage is not available. Nothing to clear.');
      return;
    }

    try {
      clearStoredSessionHistory();
      setSessions([]);
    } catch (error) {
      console.error('Failed to clear session history:', error);
    }
  }, [isStorageAvailable_]);

  /**
   * Initialize hook by loading existing history
   */
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    sessions,
    addSession,
    getHistory,
    clearHistory,
    isStorageAvailable: isStorageAvailable_
  };
}