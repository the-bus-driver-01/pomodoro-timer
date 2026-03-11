/**
 * Main exports for Pomodoro session history tracking
 */

// Types
export type { SessionRecord, SessionType, SessionHistoryFilter, SessionHistoryService } from './types/session';

// Service functions
export {
  addSessionRecord,
  getSessionHistory,
  getSessionsByDate,
  clearSessionHistory,
  isStorageAvailable
} from './services/sessionHistoryService';

// React hook
export { useSessionHistory } from './hooks/useSessionHistory';