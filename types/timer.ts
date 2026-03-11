export type SessionType = 'work' | 'break';

export interface TimerState {
  currentTime: number;
  sessionType: SessionType;
  isRunning: boolean;
  isCompleted: boolean;
}

export interface TimerConfig {
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
}

export interface UseTimerReturn {
  currentTime: number;
  sessionType: SessionType;
  isRunning: boolean;
  isCompleted: boolean;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
}