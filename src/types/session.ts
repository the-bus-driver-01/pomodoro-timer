/**
 * Session types and interfaces for Pomodoro session history tracking
 */

/**
 * Session type enumeration
 */
export type SessionType = 'work' | 'break';

/**
 * Session record interface
 */
export interface SessionRecord {
  /** Type of the session (work or break) */
  type: SessionType;

  /** Duration of the session in seconds */
  duration: number;

  /** ISO timestamp of when the session was recorded */
  timestamp: string;

  /** Date string in YYYY-MM-DD format for easy filtering */
  date: string;
}

/**
 * Session history filter options
 */
export interface SessionHistoryFilter {
  /** Filter sessions by specific date (YYYY-MM-DD format) */
  date?: string;

  /** Filter sessions by type */
  type?: SessionType;
}

/**
 * Session history service interface
 */
export interface SessionHistoryService {
  addSession: (type: SessionType, duration: number) => void;
  getHistory: (filter?: SessionHistoryFilter) => SessionRecord[];
  clearHistory: () => void;
}