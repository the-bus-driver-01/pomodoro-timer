/**
 * Session history storage service using localStorage
 */

import { SessionRecord, SessionType, SessionHistoryFilter } from '../types/session';

const STORAGE_KEY = 'pomodoro-session-history';
const STORAGE_QUOTA_WARNING_THRESHOLD = 0.9; // 90% of quota

/**
 * Format a date as YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get current storage usage as a percentage (0-1)
 */
function getStorageUsageRatio(): number {
  try {
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    // Rough estimation of localStorage limit (varies by browser, typically 5-10MB)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB
    return totalSize / estimatedLimit;
  } catch (error) {
    console.warn('Unable to check localStorage usage:', error);
    return 0;
  }
}

/**
 * Check localStorage quota and log warnings if approaching limit
 */
function checkStorageQuota(): void {
  const usage = getStorageUsageRatio();
  if (usage > STORAGE_QUOTA_WARNING_THRESHOLD) {
    console.warn(
      `localStorage usage is at ${(usage * 100).toFixed(1)}%. Consider clearing old session data.`
    );
  }
}

/**
 * Safely parse JSON from localStorage with error handling
 */
function parseStoredSessions(): SessionRecord[] {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      return [];
    }

    const parsed = JSON.parse(storedData);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid session history data format, resetting');
      return [];
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse session history from localStorage:', error);
    return [];
  }
}

/**
 * Safely save sessions to localStorage with error handling
 */
function saveSessionsToStorage(sessions: SessionRecord[]): boolean {
  try {
    const serialized = JSON.stringify(sessions);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Unable to save session.');
    } else {
      console.error('Failed to save session history:', error);
    }
    return false;
  }
}

/**
 * Add a new session record to localStorage
 */
export function addSessionRecord(type: SessionType, duration: number): void {
  const now = new Date();
  const sessionRecord: SessionRecord = {
    type,
    duration,
    timestamp: now.toISOString(),
    date: formatDate(now)
  };

  const existingSessions = parseStoredSessions();
  existingSessions.push(sessionRecord);

  // Sort sessions by timestamp (chronological order)
  existingSessions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const success = saveSessionsToStorage(existingSessions);
  if (success) {
    checkStorageQuota();
  }
}

/**
 * Retrieve session history from localStorage with optional filtering
 */
export function getSessionHistory(filter?: SessionHistoryFilter): SessionRecord[] {
  const sessions = parseStoredSessions();

  if (!filter) {
    return sessions;
  }

  return sessions.filter((session) => {
    if (filter.date && session.date !== filter.date) {
      return false;
    }

    if (filter.type && session.type !== filter.type) {
      return false;
    }

    return true;
  });
}

/**
 * Get sessions for a specific date
 */
export function getSessionsByDate(date: string): SessionRecord[] {
  return getSessionHistory({ date });
}

/**
 * Clear all session history from localStorage
 */
export function clearSessionHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session history:', error);
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}