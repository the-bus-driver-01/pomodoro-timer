import { useState, useEffect, useCallback } from 'react';
import { TimerState, TimerMode, TimerConfig } from '@/types/timer';

const DEFAULT_CONFIG: TimerConfig = {
  workTime: 25 * 60, // 25 minutes
  shortBreakTime: 5 * 60, // 5 minutes
  longBreakTime: 15 * 60, // 15 minutes
  roundsBeforeLongBreak: 4,
};

export const useTimer = (config: TimerConfig = DEFAULT_CONFIG) => {
  const [timerState, setTimerState] = useState<TimerState>({
    mode: 'work',
    timeLeft: config.workTime,
    isActive: false,
    isCompleted: false,
    round: 1,
  });

  const getTimeForMode = useCallback((mode: TimerMode): number => {
    switch (mode) {
      case 'work':
        return config.workTime;
      case 'shortBreak':
        return config.shortBreakTime;
      case 'longBreak':
        return config.longBreakTime;
    }
  }, [config]);

  const getNextMode = useCallback((currentMode: TimerMode, round: number): TimerMode => {
    if (currentMode === 'work') {
      return round % config.roundsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
    }
    return 'work';
  }, [config.roundsBeforeLongBreak]);

  const start = useCallback(() => {
    setTimerState(prev => ({ ...prev, isActive: true, isCompleted: false }));
  }, []);

  const pause = useCallback(() => {
    setTimerState(prev => ({ ...prev, isActive: false }));
  }, []);

  const reset = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      timeLeft: getTimeForMode(prev.mode),
      isActive: false,
      isCompleted: false,
    }));
  }, [getTimeForMode]);

  const skip = useCallback(() => {
    setTimerState(prev => {
      const nextMode = getNextMode(prev.mode, prev.round);
      const nextRound = prev.mode === 'work' ? prev.round : prev.round + 1;

      return {
        mode: nextMode,
        timeLeft: getTimeForMode(nextMode),
        isActive: false,
        isCompleted: false,
        round: nextRound,
      };
    });
  }, [getTimeForMode, getNextMode]);

  const getProgress = useCallback(() => {
    const totalTime = getTimeForMode(timerState.mode);
    return ((totalTime - timerState.timeLeft) / totalTime) * 100;
  }, [timerState.mode, timerState.timeLeft, getTimeForMode]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerState.isActive && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (timerState.timeLeft === 0 && timerState.isActive) {
      // Timer completed
      setTimerState(prev => ({
        ...prev,
        isActive: false,
        isCompleted: true,
      }));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isActive, timerState.timeLeft]);

  return {
    timerState,
    start,
    pause,
    reset,
    skip,
    getProgress,
    formatTime,
    getTimeForMode,
  };
};