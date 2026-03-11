'use client';

import { useTimer } from '@/hooks/useTimer';
import { SessionData } from '@/types/timer';
import { useCallback, useState } from 'react';

export const Timer = () => {
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);

  const handleSessionComplete = useCallback((sessionData: SessionData) => {
    console.log('Session completed:', sessionData);
    setSessionHistory(prev => [...prev, sessionData]);
  }, []);

  const {
    isRunning,
    elapsed,
    duration,
    sessionType,
    remaining,
    progress,
    settings,
    start,
    pause,
    reset,
    updateSettings,
  } = useTimer(handleSessionComplete);

  // Format time display (MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSettingsChange = (field: 'workInterval' | 'breakInterval', value: number) => {
    const newSettings = {
      ...settings,
      [field]: value * 60, // Convert minutes to seconds
    };
    updateSettings(newSettings);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Pomodoro Timer</h1>

      {/* Current Session Display */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{
          color: sessionType === 'work' ? '#e53e3e' : '#38a169',
          textTransform: 'capitalize'
        }}>
          {sessionType} Session
        </h2>

        <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
          {formatTime(remaining)}
        </div>

        <div style={{
          width: '300px',
          height: '20px',
          backgroundColor: '#e2e8f0',
          borderRadius: '10px',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: sessionType === 'work' ? '#e53e3e' : '#38a169',
              transition: 'width 0.5s ease'
            }}
          />
        </div>

        <div style={{ marginTop: '10px', color: '#666' }}>
          {formatTime(elapsed)} / {formatTime(duration)}
        </div>
      </div>

      {/* Controls */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={isRunning ? pause : start}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isRunning ? '#f56565' : '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>

        <button
          onClick={reset}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#a0aec0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      {/* Settings */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Settings</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <label>
            Work Interval (minutes):
            <input
              type="number"
              min="1"
              max="60"
              value={settings.workInterval / 60}
              onChange={(e) => handleSettingsChange('workInterval', parseInt(e.target.value) || 1)}
              style={{ marginLeft: '8px', padding: '4px', width: '60px' }}
            />
          </label>

          <label>
            Break Interval (minutes):
            <input
              type="number"
              min="1"
              max="30"
              value={settings.breakInterval / 60}
              onChange={(e) => handleSettingsChange('breakInterval', parseInt(e.target.value) || 1)}
              style={{ marginLeft: '8px', padding: '4px', width: '60px' }}
            />
          </label>
        </div>
      </div>

      {/* Session History */}
      <div>
        <h3>Session History</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {sessionHistory.length === 0 ? (
            <p style={{ color: '#666' }}>No sessions completed yet</p>
          ) : (
            sessionHistory.slice(-10).reverse().map((session, index) => (
              <div
                key={`${session.timestamp.getTime()}-${index}`}
                style={{
                  padding: '8px',
                  margin: '4px 0',
                  backgroundColor: session.type === 'work' ? '#fed7d7' : '#c6f6d5',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <strong style={{ textTransform: 'capitalize' }}>
                  {session.type}
                </strong> session completed ({formatTime(session.duration)})
                at {session.timestamp.toLocaleTimeString()}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};