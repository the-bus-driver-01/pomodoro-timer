export type SessionType = 'work' | 'break';

export interface TimerSettings {
  workInterval: number; // in seconds
  breakInterval: number; // in seconds
}

export interface SessionData {
  type: SessionType;
  duration: number; // in seconds
  timestamp: Date;
}

export interface TimerState {
  isRunning: boolean;
  elapsed: number; // in seconds
  duration: number; // in seconds
  sessionType: SessionType;
}

export type OnSessionCompleteCallback = (sessionData: SessionData) => void;