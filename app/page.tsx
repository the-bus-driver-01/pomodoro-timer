'use client';

import { useTimer } from './hooks/useTimer';
import { TimerControls } from './components/TimerControls';

export default function PomodoroTimer() {
  const {
    timeLeft,
    isRunning,
    isWorkSession,
    progress,
    phase,
    animationState,
    toggleTimer,
    resetTimer,
    formatTime,
    getAnimationClasses,
    getColorClasses
  } = useTimer();

  // Dynamic background color based on session and progress
  const getBackgroundGradient = () => {
    switch (animationState.colorTheme) {
      case 'red': return 'from-red-50 to-red-100';
      case 'orange': return 'from-orange-50 to-orange-100';
      case 'blue': return 'from-blue-50 to-indigo-100';
      case 'green': return isWorkSession ? 'from-green-50 to-emerald-100' : 'from-green-50 to-emerald-100';
      default: return 'from-gray-50 to-gray-100';
    }
  };

  // Enhanced timer background with urgency-based styling
  const getTimerBackground = () => {
    const baseClasses = 'bg-white border-4 transition-colors-smooth';
    const urgencyClasses = {
      low: 'shadow-lg',
      medium: 'shadow-xl',
      high: 'shadow-2xl',
      critical: 'shadow-2xl animate-progress-glow'
    };

    return `${baseClasses} ${urgencyClasses[animationState.urgencyLevel]} ${getColorClasses()}`;
  };

  // Enhanced animation classes using the hook's optimization
  const getTimerAnimationClasses = () => {
    const hookClasses = getAnimationClasses();
    const additionalClasses = [];

    if (isRunning && animationState.urgencyLevel === 'critical') {
      additionalClasses.push('animate-progress-glow');
    }

    return `${hookClasses} ${additionalClasses.join(' ')}`;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} flex items-center justify-center p-4 transition-all-smooth`}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-status-fade">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 transition-colors-smooth">
          Pomodoro Timer
        </h1>

        {/* Status indicator with enhanced animations */}
        <div className={`
          text-lg font-medium mb-6 px-4 py-2 rounded-full inline-block
          animate-status-fade transition-all-smooth transform
          ${isWorkSession
            ? 'bg-blue-100 text-blue-800 border-2 border-blue-200 hover:scale-105'
            : 'bg-green-100 text-green-800 border-2 border-green-200 hover:scale-105'
          }
        `}>
          {isWorkSession ? '🍅 Work Session' : '☕ Break Time'}
        </div>

        {/* Enhanced timer display with comprehensive animations */}
        <div className={`
          text-6xl font-mono font-bold mb-8 p-6 rounded-xl
          ${getTimerBackground()}
          ${getTimerAnimationClasses()}
          transition-all-smooth transform
          hover:scale-105 cursor-default select-none
        `}>
          <div className="animate-digit-flip">
            {formatTime(timeLeft)}
          </div>

          {/* Progress bar visual indicator */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`
                h-full transition-all-smooth rounded-full
                ${animationState.colorTheme === 'blue' && 'bg-blue-500'}
                ${animationState.colorTheme === 'orange' && 'bg-orange-500'}
                ${animationState.colorTheme === 'red' && 'bg-red-500 animate-progress-glow'}
                ${animationState.colorTheme === 'green' && 'bg-green-500'}
                ${animationState.shouldFlash && 'animate-warning-flash'}
              `}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Session completion indicator */}
        {animationState.shouldCelebrate && (
          <div className="animate-celebrate text-2xl mb-4 transition-all-smooth">
            🎉 {isWorkSession ? 'Work Complete!' : 'Break Complete!'} 🎉
          </div>
        )}

        <TimerControls
          isRunning={isRunning}
          onToggle={toggleTimer}
          onReset={resetTimer}
        />

        {/* Progress indicator text */}
        <div className="mt-4 text-sm text-gray-500 transition-colors-smooth">
          Progress: {Math.round(progress * 100)}% • Phase: {phase} • Urgency: {animationState.urgencyLevel}
        </div>
      </div>
    </div>
  );
}