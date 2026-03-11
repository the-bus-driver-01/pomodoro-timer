import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export type TimerPhase = 'start' | 'mid' | 'warning' | 'complete';

export interface TimerAnimationState {
  progress: number; // 0-1 for animations (1 = full time, 0 = time up)
  phase: TimerPhase;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'; // For different animation intensities
  shouldPulse: boolean;
  shouldFlash: boolean;
  shouldCelebrate: boolean;
  colorTheme: 'blue' | 'orange' | 'red' | 'green';
  previousTimeLeft: number; // For digit flip animations
  justCompleted: boolean; // Flag for completion animations
}

export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isWorkSession: boolean;
  animationState: TimerAnimationState;
}

export const useTimer = (workDuration: number = 25 * 60, breakDuration: number = 5 * 60) => {
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [initialTime, setInitialTime] = useState(workDuration);
  const [justCompleted, setJustCompleted] = useState(false);
  const previousTimeLeftRef = useRef(workDuration);

  // Calculate progress (1 = full time, 0 = time up)
  const progress = useMemo(() => {
    return initialTime > 0 ? timeLeft / initialTime : 0;
  }, [timeLeft, initialTime]);

  // Calculate timer phase for animations with more nuanced thresholds
  const phase: TimerPhase = useMemo(() => {
    if (timeLeft === 0) return 'complete';
    if (progress > 0.75) return 'start';
    if (progress > 0.25) return 'mid';
    return 'warning';
  }, [timeLeft, progress]);

  // Calculate urgency level for different animation intensities
  const urgencyLevel = useMemo(() => {
    if (progress > 0.75) return 'low';
    if (progress > 0.5) return 'medium';
    if (progress > 0.25) return 'high';
    return 'critical';
  }, [progress]);

  // Color theme based on phase and session type
  const colorTheme = useMemo(() => {
    if (phase === 'complete') return 'green';
    if (phase === 'warning') return 'red';
    if (phase === 'mid') return 'orange';
    return isWorkSession ? 'blue' : 'green';
  }, [phase, isWorkSession]);

  // Animation state object with optimized calculations
  const animationState: TimerAnimationState = useMemo(() => ({
    progress,
    phase,
    urgencyLevel,
    shouldPulse: isRunning && phase !== 'complete',
    shouldFlash: phase === 'warning' && isRunning,
    shouldCelebrate: justCompleted,
    colorTheme,
    previousTimeLeft: previousTimeLeftRef.current,
    justCompleted,
  }), [progress, phase, urgencyLevel, isRunning, justCompleted, colorTheme]);

  // Timer effect with performance optimization
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          previousTimeLeftRef.current = prev;

          if (prev <= 1) {
            // Timer completed
            setIsRunning(false);
            setJustCompleted(true);

            // Clear completion flag after celebration animation
            setTimeout(() => setJustCompleted(false), 2000);

            // Switch session type
            const newIsWork = !isWorkSession;
            const newTime = newIsWork ? workDuration : breakDuration;
            setIsWorkSession(newIsWork);
            setInitialTime(newTime);
            return newTime;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isWorkSession, workDuration, breakDuration]);

  // Clear completion flag when timer starts again
  useEffect(() => {
    if (isRunning && justCompleted) {
      setJustCompleted(false);
    }
  }, [isRunning, justCompleted]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setJustCompleted(false);
    const resetTime = isWorkSession ? workDuration : breakDuration;
    setTimeLeft(resetTime);
    setInitialTime(resetTime);
    previousTimeLeftRef.current = resetTime;
  }, [isWorkSession, workDuration, breakDuration]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Additional animation helper functions
  const getAnimationClasses = useCallback(() => {
    const classes = [];

    if (animationState.shouldPulse) classes.push('animate-timer-pulse');
    if (animationState.shouldFlash) classes.push('animate-warning-flash');
    if (animationState.shouldCelebrate) classes.push('animate-celebrate');

    return classes.join(' ');
  }, [animationState]);

  const getColorClasses = useCallback(() => {
    switch (animationState.colorTheme) {
      case 'blue': return 'text-blue-600 border-blue-200';
      case 'orange': return 'text-orange-500 border-orange-200';
      case 'red': return 'text-red-500 border-red-200';
      case 'green': return 'text-green-500 border-green-200';
      default: return 'text-gray-600 border-gray-200';
    }
  }, [animationState.colorTheme]);

  return {
    // Core timer state
    timeLeft,
    isRunning,
    isWorkSession,

    // Animation state
    progress,
    phase,
    animationState,

    // Actions
    toggleTimer,
    resetTimer,

    // Utilities
    formatTime,
    getAnimationClasses,
    getColorClasses,

    // Additional computed values
    minutesLeft: Math.floor(timeLeft / 60),
    secondsLeft: timeLeft % 60,
    percentComplete: (1 - progress) * 100,
  };
};