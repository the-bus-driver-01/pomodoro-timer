'use client';

import TimerControls from './components/TimerControls';
import { useTimer } from './hooks/useTimer';

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function Home() {
  const { time, isRunning, start, pause, reset } = useTimer(1500); // 25 minutes

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Pomodoro Timer
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Stay focused and productive with the Pomodoro Technique
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className="text-6xl md:text-8xl font-mono font-bold text-gray-800 mb-4">
              {formatTime(time)}
            </div>
            <div className="text-xl text-gray-600">
              {isRunning ? 'Focus Time' : time === 0 ? 'Time\'s Up!' : 'Ready to Start'}
            </div>
          </div>

          {/* Timer Controls */}
          <TimerControls
            isRunning={isRunning}
            start={start}
            pause={pause}
            reset={reset}
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            The Pomodoro Technique: Work for 25 minutes, then take a 5-minute break
          </p>
        </div>
      </div>
    </main>
  );
}