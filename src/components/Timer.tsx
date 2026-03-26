'use client';

import React from 'react';
import { useTimer } from '@/hooks';

const Timer: React.FC = () => {
  const { elapsed, duration, sessionType, isRunning, start, pause, reset } = useTimer();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 1000 / 60);
    const remainingSeconds = Math.floor((seconds / 1000) % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = (elapsed / duration) * 100;

  return (
    <div className="timer-container">
      <div className="timer-display">
        <h1 className="session-type">
          {sessionType === 'work' ? '🍅 Work Session' : '☕ Break Time'}
        </h1>

        <div className="time-display">
          {formatTime(elapsed)} / {formatTime(duration)}
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="controls">
          <button
            onClick={isRunning ? pause : start}
            className={`control-btn ${isRunning ? 'pause' : 'start'}`}
          >
            {isRunning ? '⏸️ Pause' : '▶️ Start'}
          </button>

          <button onClick={reset} className="control-btn reset">
            🔄 Reset
          </button>
        </div>

        <div className="status">
          Status: {isRunning ? 'Running' : 'Paused'}
        </div>
      </div>

      <style jsx>{`
        .timer-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .session-type {
          font-size: 2rem;
          margin-bottom: 20px;
          color: ${sessionType === 'work' ? '#d32f2f' : '#1976d2'};
        }

        .time-display {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
        }

        .progress-bar {
          width: 100%;
          height: 10px;
          background-color: #e0e0e0;
          border-radius: 5px;
          margin-bottom: 30px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: ${sessionType === 'work' ? '#d32f2f' : '#1976d2'};
          transition: width 0.1s ease;
        }

        .controls {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .control-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-btn.start {
          background-color: #4caf50;
          color: white;
        }

        .control-btn.pause {
          background-color: #ff9800;
          color: white;
        }

        .control-btn.reset {
          background-color: #757575;
          color: white;
        }

        .control-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .status {
          font-size: 0.9rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Timer;