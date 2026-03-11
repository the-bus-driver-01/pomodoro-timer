import React from 'react'

interface TimerDisplayProps {
  elapsed: number // elapsed time in seconds
  duration: number // total duration in seconds
  sessionType: 'work' | 'break'
}

export default function TimerDisplay({ elapsed, duration, sessionType }: TimerDisplayProps) {
  // Calculate remaining time
  const remainingTime = Math.max(0, duration - elapsed)

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get colors and labels based on session type
  const getSessionConfig = () => {
    if (sessionType === 'work') {
      return {
        label: 'Work Session',
        textColor: 'text-red-600',
        bgGradient: 'from-red-50 to-red-100',
        borderColor: 'border-red-200',
        labelBg: 'bg-red-100'
      }
    } else {
      return {
        label: 'Break Session',
        textColor: 'text-green-600',
        bgGradient: 'from-green-50 to-green-100',
        borderColor: 'border-green-200',
        labelBg: 'bg-green-100'
      }
    }
  }

  const config = getSessionConfig()

  return (
    <div className={`
      flex flex-col items-center justify-center p-8 rounded-2xl
      bg-gradient-to-br ${config.bgGradient}
      border-2 ${config.borderColor}
      shadow-lg
      min-h-[300px]
    `}>
      {/* Session type label */}
      <div className={`
        text-lg font-semibold mb-4 px-4 py-2 rounded-full
        ${config.textColor} ${config.labelBg}
        border ${config.borderColor}
        shadow-sm
      `}>
        {config.label}
      </div>

      {/* Timer display */}
      <div className={`
        text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold
        ${config.textColor}
        font-mono tracking-wider
        text-center
      `}>
        {formatTime(remainingTime)}
      </div>
    </div>
  )
}