import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, SessionType, TimerConfig, UseTimerReturn } from '../types/timer';
import { sendNotification } from '../services/notificationService';

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 25 * 60, // 25 minutes in seconds
  breakDuration: 5 * 60, // 5 minutes in seconds
};

export const useTimer = (config: TimerConfig = DEFAULT_CONFIG): UseTimerReturn => {
  const [timerState, setTimerState] = useState<TimerState>({
    currentTime: config.workDuration,
    sessionType: 'work',
    isRunning: false,
    isCompleted: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completionHandlerRef = useRef<{
    onWorkComplete?: () => void;
    onBreakComplete?: () => void;
  }>({});

  // Session completion handlers
  const handleWorkSessionComplete = useCallback(async () => {
    console.log('Work session completed');

    // Send notification for work session completion
    try {
      await sendNotification(
        'Work Session Complete!',
        'Time for a break. You\'ve earned it!',
        {
          tag: 'pomodoro-work-complete',
          requireInteraction: true
        }
      );
    } catch (error) {
      console.warn('Failed to send work completion notification:', error);
    }

    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isCompleted: true,
      sessionType: 'break',
      currentTime: config.breakDuration,
    }));

    // Call work completion handler if provided
    if (completionHandlerRef.current.onWorkComplete) {
      completionHandlerRef.current.onWorkComplete();
    }
  }, [config.breakDuration]);

  const handleBreakSessionComplete = useCallback(async () => {
    console.log('Break session completed');

    // Send notification for break session completion
    try {
      await sendNotification(
        'Break Time Over!',
        'Ready to get back to work? Let\'s stay focused!',
        {
          tag: 'pomodoro-break-complete',
          requireInteraction: true
        }
      );
    } catch (error) {
      console.warn('Failed to send break completion notification:', error);
    }

    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isCompleted: true,
      sessionType: 'work',
      currentTime: config.workDuration,
    }));

    // Call break completion handler if provided
    if (completionHandlerRef.current.onBreakComplete) {
      completionHandlerRef.current.onBreakComplete();
    }
  }, [config.workDuration]);

  // Countdown effect
  useEffect(() => {
    if (timerState.isRunning && timerState.currentTime > 0) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          const newTime = prev.currentTime - 1;

          if (newTime <= 0) {
            // Session completed
            if (prev.sessionType === 'work') {
              // Don't update time to 0, let handleWorkSessionComplete manage the transition
              handleWorkSessionComplete();
              return prev;
            } else {
              // Don't update time to 0, let handleBreakSessionComplete manage the transition
              handleBreakSessionComplete();
              return prev;
            }
          }

          return {
            ...prev,
            currentTime: newTime,
            isCompleted: false,
          };
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState.isRunning, timerState.currentTime, handleWorkSessionComplete, handleBreakSessionComplete]);

  // Timer control methods
  const start = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      isCompleted: false,
    }));
  }, []);

  const pause = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  const stop = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isCompleted: false,
      currentTime: prev.sessionType === 'work' ? config.workDuration : config.breakDuration,
    }));
  }, [config.workDuration, config.breakDuration]);

  const reset = useCallback(() => {
    setTimerState({
      currentTime: config.workDuration,
      sessionType: 'work',
      isRunning: false,
      isCompleted: false,
    });
  }, [config.workDuration]);

  // Set completion handlers (will be used in step 2)
  const setCompletionHandlers = useCallback((handlers: {
    onWorkComplete?: () => void;
    onBreakComplete?: () => void;
  }) => {
    completionHandlerRef.current = handlers;
  }, []);

  return {
    currentTime: timerState.currentTime,
    sessionType: timerState.sessionType,
    isRunning: timerState.isRunning,
    isCompleted: timerState.isCompleted,
    start,
    pause,
    stop,
    reset,
    // Internal method for step 2
    _setCompletionHandlers: setCompletionHandlers,
  } as UseTimerReturn & { _setCompletionHandlers: typeof setCompletionHandlers };
};