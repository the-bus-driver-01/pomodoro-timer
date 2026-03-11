import { useState, useEffect, useRef } from 'react'
import styles from '@/styles/Timer.module.css'

interface TimerProps {
  workDuration: number
  breakDuration: number
}

type TimerMode = 'work' | 'break'
type TimerStatus = 'idle' | 'running' | 'paused'

export default function Timer({ workDuration, breakDuration }: TimerProps) {
  const [mode, setMode] = useState<TimerMode>('work')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(workDuration * 60)
  const [totalTime, setTotalTime] = useState(workDuration * 60)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update timer when duration settings change
  useEffect(() => {
    if (status === 'idle') {
      const newTotalTime = mode === 'work' ? workDuration * 60 : breakDuration * 60
      setTimeLeft(newTotalTime)
      setTotalTime(newTotalTime)
    }
  }, [workDuration, breakDuration, mode, status])

  // Timer countdown logic
  useEffect(() => {
    if (status === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStatus('idle')
            // Auto-switch to next mode
            const nextMode = mode === 'work' ? 'break' : 'work'
            const nextDuration = nextMode === 'work' ? workDuration : breakDuration
            setMode(nextMode)
            const nextTotalTime = nextDuration * 60
            setTotalTime(nextTotalTime)
            return nextTotalTime
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [status, timeLeft, mode, workDuration, breakDuration])

  const startTimer = () => {
    setStatus('running')
  }

  const pauseTimer = () => {
    setStatus('paused')
  }

  const resetTimer = () => {
    setStatus('idle')
    const resetTime = mode === 'work' ? workDuration * 60 : breakDuration * 60
    setTimeLeft(resetTime)
    setTotalTime(resetTime)
  }

  const switchMode = () => {
    const newMode = mode === 'work' ? 'break' : 'work'
    setMode(newMode)
    setStatus('idle')
    const newTime = newMode === 'work' ? workDuration * 60 : breakDuration * 60
    setTimeLeft(newTime)
    setTotalTime(newTime)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  return (
    <div className={styles.timer}>
      <div className={`${styles.modeIndicator} ${styles[mode]}`}>
        {mode === 'work' ? '🍅 Work Time' : '☕ Break Time'}
      </div>

      <div className={styles.timeDisplay}>
        {formatTime(timeLeft)}
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progress}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.controls}>
        {status === 'idle' && (
          <button className={styles.startButton} onClick={startTimer}>
            Start
          </button>
        )}

        {status === 'running' && (
          <button className={styles.pauseButton} onClick={pauseTimer}>
            Pause
          </button>
        )}

        {status === 'paused' && (
          <>
            <button className={styles.resumeButton} onClick={startTimer}>
              Resume
            </button>
            <button className={styles.resetButton} onClick={resetTimer}>
              Reset
            </button>
          </>
        )}

        {(status === 'idle' || status === 'paused') && (
          <button className={styles.switchButton} onClick={switchMode}>
            Switch to {mode === 'work' ? 'Break' : 'Work'}
          </button>
        )}
      </div>
    </div>
  )
}