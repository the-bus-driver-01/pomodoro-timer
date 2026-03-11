'use client';

import { useState } from 'react';

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export const TimerControls = ({ isRunning, onToggle, onReset }: TimerControlsProps) => {
  const [isTogglePressed, setIsTogglePressed] = useState(false);
  const [isResetPressed, setIsResetPressed] = useState(false);

  const handleToggleClick = () => {
    setIsTogglePressed(true);
    onToggle();
    setTimeout(() => setIsTogglePressed(false), 150);
  };

  const handleResetClick = () => {
    setIsResetPressed(true);
    onReset();
    setTimeout(() => setIsResetPressed(false), 150);
  };

  // Enhanced button styling with animations
  const getToggleButtonClasses = () => {
    const baseClasses = `
      px-8 py-4 text-lg font-semibold rounded-lg
      btn-interactive btn-press-feedback
      transition-all-smooth transform
      focus:outline-none focus:ring-4 focus:ring-opacity-50
      shadow-lg hover:shadow-xl
      relative overflow-hidden
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const stateClasses = isRunning
      ? `bg-red-500 hover:bg-red-600 focus:bg-red-700 text-white focus:ring-red-300
         hover:scale-105 active:scale-95`
      : `bg-green-500 hover:bg-green-600 focus:bg-green-700 text-white focus:ring-green-300
         hover:scale-105 active:scale-95`;

    const animationClasses = isTogglePressed ? 'animate-button-press' : '';

    return `${baseClasses} ${stateClasses} ${animationClasses}`;
  };

  const getResetButtonClasses = () => {
    const baseClasses = `
      px-8 py-4 text-lg font-semibold rounded-lg
      btn-interactive btn-press-feedback
      transition-all-smooth transform
      focus:outline-none focus:ring-4 focus:ring-opacity-50
      shadow-lg hover:shadow-xl
      relative overflow-hidden
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const stateClasses = `
      bg-gray-500 hover:bg-gray-600 focus:bg-gray-700 text-white focus:ring-gray-300
      hover:scale-105 active:scale-95
    `;

    const animationClasses = isResetPressed ? 'animate-button-press' : '';

    return `${baseClasses} ${stateClasses} ${animationClasses}`;
  };

  return (
    <div className="flex gap-4 justify-center mt-8">
      {/* Enhanced Toggle Button */}
      <button
        onClick={handleToggleClick}
        className={getToggleButtonClasses()}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {/* Button icon based on state */}
        <span className="flex items-center gap-2">
          <span className="text-xl">
            {isRunning ? '⏸️' : '▶️'}
          </span>
          <span className="font-bold">
            {isRunning ? 'Pause' : 'Start'}
          </span>
        </span>

        {/* Ripple effect overlay */}
        <div className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-200 bg-white rounded-lg" />
      </button>

      {/* Enhanced Reset Button */}
      <button
        onClick={handleResetClick}
        className={getResetButtonClasses()}
        aria-label="Reset timer"
      >
        <span className="flex items-center gap-2">
          <span className="text-xl">
            🔄
          </span>
          <span className="font-bold">
            Reset
          </span>
        </span>

        {/* Ripple effect overlay */}
        <div className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-200 bg-white rounded-lg" />
      </button>
    </div>
  );
};