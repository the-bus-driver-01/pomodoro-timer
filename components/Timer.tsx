import React from 'react';
import { useTimer } from '../hooks/useTimer';
import { SessionType } from '../types/timer';

interface TimerProps {
  workDuration?: number;
  breakDuration?: number;
}

const Timer: React.FC<TimerProps> = ({
  workDuration = 25 * 60, // 25 minutes
  breakDuration = 5 * 60,  // 5 minutes
}) => {
  const timer = useTimer({
    workDuration,
    breakDuration,
  });

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get session display information
  const getSessionInfo = (sessionType: SessionType) => {
    return {
      work: {
        title: 'Work Session',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        buttonColor: 'bg-red-500 hover:bg-red-600',
      },
      break: {
        title: 'Break Time',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        buttonColor: 'bg-green-500 hover:bg-green-600',
      }
    }[sessionType];
  };

  const sessionInfo = getSessionInfo(timer.sessionType);

  return (
    <div className={`min-h-screen flex items-center justify-center ${sessionInfo.bgColor}`}>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-2xl font-bold ${sessionInfo.textColor} mb-2`}>
            {sessionInfo.title}
          </h1>
          {timer.isCompleted && (
            <p className="text-sm text-gray-600">
              Session completed!
              {timer.sessionType === 'work' ? ' Time for a break.' : ' Ready to work?'}
            </p>
          )}
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className={`text-6xl font-mono font-bold ${sessionInfo.textColor}`}>
            {formatTime(timer.currentTime)}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {timer.sessionType === 'work' ? 'Focus time' : 'Relaxation time'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!timer.isRunning ? (
            <button
              onClick={timer.start}
              className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors ${sessionInfo.buttonColor}`}
            >
              {timer.currentTime === (timer.sessionType === 'work' ? workDuration : breakDuration) ? 'Start' : 'Resume'}
            </button>
          ) : (
            <button
              onClick={timer.pause}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors"
            >
              Pause
            </button>
          )}

          <button
            onClick={timer.stop}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Stop
          </button>

          <button
            onClick={timer.reset}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${sessionInfo.buttonColor.split(' ')[0]}`}
              style={{
                width: `${((timer.sessionType === 'work' ? workDuration : breakDuration) - timer.currentTime) /
                  (timer.sessionType === 'work' ? workDuration : breakDuration) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Session Status */}
        <div className="mt-4 text-center text-sm text-gray-600">
          {timer.isRunning && 'Timer is running...'}
          {!timer.isRunning && !timer.isCompleted && 'Timer paused'}
          {timer.isCompleted && 'Session completed! Click Start to begin the next session.'}
        </div>
      </div>
    </div>
  );
};

export default Timer;