'use client';

import SessionHistory from '@/components/SessionHistory';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pomodoro Session Tracker
          </h1>
          <p className="text-gray-600">
            Track and review your Pomodoro sessions to improve your productivity.
          </p>
        </div>

        <SessionHistory className="h-96" />
      </div>
    </div>
  );
}