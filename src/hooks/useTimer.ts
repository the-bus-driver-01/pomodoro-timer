import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerState {
  elapsed: number;
  duration: number;
  sessionType: 'work' | 'break';
  isRunning: boolean;
}

interface TimerControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
}

interface CustomIntervals {
  work: number;
  break: number;
}

type UseTimerReturn = TimerState & TimerControls;

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const INTERVAL_MS = 100;

const useTimer = (): UseTimerReturn => {
  // Get custom intervals from localStorage or use defaults
  const getCustomIntervals = useCallback((): CustomIntervals => {
    if (typeof window === 'undefined') {
      return {
        work: DEFAULT_WORK_MINUTES * 60 * 1000,
        break: DEFAULT_BREAK_MINUTES * 60 * 1000,
      };
    }

    try {
      const workMinutes = localStorage.getItem('work-interval');
      const breakMinutes = localStorage.getItem('break-interval');

      return {
        work: workMinutes ? parseInt(workMinutes, 10) * 60 * 1000 : DEFAULT_WORK_MINUTES * 60 * 1000,
        break: breakMinutes ? parseInt(breakMinutes, 10) * 60 * 1000 : DEFAULT_BREAK_MINUTES * 60 * 1000,
      };
    } catch (error) {
      return {
        work: DEFAULT_WORK_MINUTES * 60 * 1000,
        break: DEFAULT_BREAK_MINUTES * 60 * 1000,
      };
    }
  }, []);

  const intervals = useRef<CustomIntervals>(getCustomIntervals());

  const [elapsed, setElapsed] = useState(0);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [isRunning, setIsRunning] = useState(false);

  const duration = sessionType === 'work' ? intervals.current.work : intervals.current.break;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reset timer
  const reset = useCallback(() => {
    setElapsed(0);
    setIsRunning(false);
  }, []);

  // Handle timer tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsed(prevElapsed => {
        const newElapsed = prevElapsed + INTERVAL_MS;

        // Check if we've reached or exceeded the duration
        if (newElapsed >= duration) {
          // Toggle session type
          setSessionType(prevType => prevType === 'work' ? 'break' : 'work');
          // Reset elapsed time for new session
          return 0;
        }

        return newElapsed;
      });
    }, INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, duration]);

  // Update intervals when localStorage changes
  useEffect(() => {
    intervals.current = getCustomIntervals();
  }, [getCustomIntervals]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    elapsed,
    duration,
    sessionType,
    isRunning,
    start,
    pause,
    reset,
  };
};

export default useTimer;