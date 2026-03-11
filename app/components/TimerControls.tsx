'use client';

import React from 'react';

interface TimerControlsProps {
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export default function TimerControls({ isRunning, start, pause, reset }: TimerControlsProps) {
  const handleStartPauseClick = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  const handleResetClick = () => {
    reset();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
      {/* Start/Pause Button */}
      <button
        onClick={handleStartPauseClick}
        className="flex-1 px-6 py-3 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   rounded-lg transition-colors duration-200 ease-in-out"
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>

      {/* Reset Button */}
      <button
        onClick={handleResetClick}
        className="flex-1 px-6 py-3 text-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300
                   focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                   rounded-lg transition-colors duration-200 ease-in-out"
      >
        Reset
      </button>
    </div>
  );
}