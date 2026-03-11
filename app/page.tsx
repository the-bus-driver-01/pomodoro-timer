'use client'

import React, { useState } from 'react'
import TimerDisplay from '@/components/TimerDisplay'

export default function Home() {
  // Demo states for testing the component
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(1500) // 25 minutes in seconds
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work')

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Pomodoro Timer
        </h1>

        {/* Timer Display Component */}
        <TimerDisplay
          elapsed={elapsed}
          duration={duration}
          sessionType={sessionType}
        />

        {/* Demo Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold mb-4">Demo Controls</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Elapsed Time (seconds)</label>
              <input
                type="number"
                value={elapsed}
                onChange={(e) => setElapsed(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="0"
                max={duration}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Session Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as 'work' | 'break')}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="work">Work</option>
                <option value="break">Break</option>
              </select>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => {
                setElapsed(0)
                setDuration(1500)
                setSessionType('work')
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              25min Work (Start)
            </button>
            <button
              onClick={() => {
                setElapsed(600)
                setDuration(1500)
                setSessionType('work')
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              25min Work (15min left)
            </button>
            <button
              onClick={() => {
                setElapsed(300)
                setDuration(300)
                setSessionType('break')
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              5min Break (Complete)
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}