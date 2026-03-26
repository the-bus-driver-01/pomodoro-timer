export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface TimerState {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  isCompleted: boolean;
  round: number;
}

export interface TimerConfig {
  workTime: number; // in seconds
  shortBreakTime: number; // in seconds
  longBreakTime: number; // in seconds
  roundsBeforeLongBreak: number;
}