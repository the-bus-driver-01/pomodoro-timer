'use client';

import React from 'react';
import { useTimer } from '@/hooks/useTimer';
import { TimerConfig } from '@/types/timer';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 200,
  strokeWidth = 8,
  color = '#4F46E5',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
    </div>
  );
};

interface TimerProps {
  config?: TimerConfig;
}

const Timer: React.FC<TimerProps> = ({ config }) => {
  const {
    timerState,
    start,
    pause,
    reset,
    skip,
    getProgress,
    formatTime,
  } = useTimer(config);

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'work':
        return '#DC2626'; // Red
      case 'shortBreak':
        return '#16A34A'; // Green
      case 'longBreak':
        return '#2563EB'; // Blue
      default:
        return '#4F46E5'; // Indigo
    }
  };

  const getModeTitle = (mode: string) => {
    switch (mode) {
      case 'work':
        return 'Work Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Timer';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg">
      {/* Mode Title */}
      <h2 className="text-2xl font-bold mb-2 text-gray-800">
        {getModeTitle(timerState.mode)}
      </h2>

      {/* Round Counter */}
      <p className="text-lg text-gray-600 mb-6">
        Round {timerState.round}
      </p>

      {/* Circular Progress Indicator */}
      <div className="relative mb-8">
        <CircularProgress
          progress={getProgress()}
          size={250}
          strokeWidth={12}
          color={getModeColor(timerState.mode)}
        />
        {/* Time Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-800">
            {formatTime(timerState.timeLeft)}
          </span>
        </div>
      </div>

      {/* Completion Message */}
      {timerState.isCompleted && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {timerState.mode === 'work' ? 'Work session completed! Time for a break.' : 'Break time is over! Ready to work?'}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex space-x-4">
        {!timerState.isActive ? (
          <button
            onClick={start}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
          >
            Pause
          </button>
        )}

        <button
          onClick={reset}
          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
        >
          Reset
        </button>

        <button
          onClick={skip}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default Timer;