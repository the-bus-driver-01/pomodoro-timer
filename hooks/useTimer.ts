import { useState, useEffect, useRef, useCallback } from 'react';
import { SessionType, TimerSettings, SessionData, TimerState, OnSessionCompleteCallback } from '@/types/timer';

const DEFAULT_SETTINGS: TimerSettings = {
  workInterval: 25 * 60, // 25 minutes in seconds
  breakInterval: 5 * 60,  // 5 minutes in seconds
};

const SETTINGS_KEY = 'pomodoro-settings';

export const useTimer = (onSessionComplete?: OnSessionCompleteCallback) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings from localStorage
  const loadSettings = useCallback((): TimerSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate settings - ensure they're positive numbers
        if (parsed.workInterval > 0 && parsed.breakInterval > 0) {
          return {
            workInterval: parsed.workInterval,
            breakInterval: parsed.breakInterval,
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }

    // Fallback to defaults for missing or invalid settings
    return DEFAULT_SETTINGS;
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: TimerSettings) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }, []);

  // Initialize settings on mount
  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
  }, [loadSettings]);

  // Get current session duration based on session type and current settings
  const getCurrentDuration = useCallback(() => {
    return sessionType === 'work' ? settings.workInterval : settings.breakInterval;
  }, [sessionType, settings]);

  // Session completion logic
  const completeSession = useCallback(() => {
    const completedSessionType = sessionType;
    const completedDuration = getCurrentDuration();
    const timestamp = new Date();

    // Switch session type
    const nextSessionType: SessionType = sessionType === 'work' ? 'break' : 'work';
    setSessionType(nextSessionType);

    // Reset elapsed time to 0
    setElapsed(0);

    // Call completion callback if provided
    if (onSessionComplete) {
      const sessionData: SessionData = {
        type: completedSessionType,
        duration: completedDuration,
        timestamp,
      };
      onSessionComplete(sessionData);
    }
  }, [sessionType, getCurrentDuration, onSessionComplete]);

  // Main timer tick logic
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const nextElapsed = prev + 1;
        const currentDuration = getCurrentDuration();

        // Check if session is complete
        if (nextElapsed >= currentDuration) {
          completeSession();
          return 0; // Reset elapsed after completion
        }

        return nextElapsed;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, completeSession, getCurrentDuration]);

  // Update timer settings
  const updateSettings = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);

    // If currently in a break and switching to work, the new work session
    // will use the updated duration (handled by getCurrentDuration())
  }, [saveSettings]);

  // Timer controls
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    setSessionType('work');
  }, []);

  // Get current timer state
  const timerState: TimerState = {
    isRunning,
    elapsed,
    duration: getCurrentDuration(),
    sessionType,
  };

  return {
    // Current state
    ...timerState,
    settings,

    // Controls
    start,
    pause,
    reset,
    updateSettings,

    // Calculated values
    remaining: getCurrentDuration() - elapsed,
    progress: elapsed / getCurrentDuration(),
  };
};