import { useState, useEffect } from 'react'

export interface TimerSettings {
  workDuration: number
  breakDuration: number
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25, // 25 minutes
  breakDuration: 5   // 5 minutes
}

const SETTINGS_STORAGE_KEY = 'pomodoro-settings'

export function useSettings() {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        // Validate the parsed settings
        if (
          typeof parsed.workDuration === 'number' &&
          typeof parsed.breakDuration === 'number' &&
          parsed.workDuration > 0 &&
          parsed.workDuration <= 99 &&
          parsed.breakDuration > 0 &&
          parsed.breakDuration <= 99
        ) {
          setSettings(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error)
    }
  }, [])

  const updateSettings = (newSettings: TimerSettings): boolean => {
    try {
      // Validate settings before saving
      if (
        newSettings.workDuration <= 0 ||
        newSettings.workDuration >= 100 ||
        newSettings.breakDuration <= 0 ||
        newSettings.breakDuration >= 100
      ) {
        return false // Invalid settings
      }

      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings))
      setSettings(newSettings)
      return true
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error)
      return false
    }
  }

  return {
    settings,
    updateSettings,
    resetSettings: () => {
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
      setSettings(DEFAULT_SETTINGS)
    }
  }
}