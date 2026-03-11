import { useState, useEffect } from 'react'
import { useSettings } from '@/hooks/useSettings'
import styles from '@/styles/SettingsPanel.module.css'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface FormErrors {
  workDuration?: string
  breakDuration?: string
  general?: string
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings()
  const [workDuration, setWorkDuration] = useState('')
  const [breakDuration, setBreakDuration] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form values when component mounts
  useEffect(() => {
    if (isOpen) {
      setWorkDuration(settings.workDuration.toString())
      setBreakDuration(settings.breakDuration.toString())
      setErrors({})
    }
  }, [isOpen, settings])

  const validateInput = (value: string, fieldName: string): string | null => {
    // Check if empty
    if (!value.trim()) {
      return `${fieldName} is required`
    }

    // Check if numeric
    const numValue = parseFloat(value)
    if (isNaN(numValue) || !Number.isInteger(numValue)) {
      return `${fieldName} must be a whole number`
    }

    // Check range
    if (numValue <= 0) {
      return `${fieldName} must be greater than 0`
    }

    if (numValue >= 100) {
      return `${fieldName} must be less than 100`
    }

    return null
  }

  const handleWorkDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWorkDuration(value)

    // Clear error when user starts typing
    if (errors.workDuration) {
      setErrors(prev => ({ ...prev, workDuration: undefined }))
    }
  }

  const handleBreakDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setBreakDuration(value)

    // Clear error when user starts typing
    if (errors.breakDuration) {
      setErrors(prev => ({ ...prev, breakDuration: undefined }))
    }
  }

  const handleWorkDurationBlur = () => {
    const error = validateInput(workDuration, 'Work duration')
    if (error) {
      setErrors(prev => ({ ...prev, workDuration: error }))
    }
  }

  const handleBreakDurationBlur = () => {
    const error = validateInput(breakDuration, 'Break duration')
    if (error) {
      setErrors(prev => ({ ...prev, breakDuration: error }))
    }
  }

  const handleSave = () => {
    setIsSubmitting(true)
    setErrors({})

    // Validate both fields
    const workError = validateInput(workDuration, 'Work duration')
    const breakError = validateInput(breakDuration, 'Break duration')

    if (workError || breakError) {
      setErrors({
        workDuration: workError || undefined,
        breakDuration: breakError || undefined
      })
      setIsSubmitting(false)
      return
    }

    // Try to save settings
    const newSettings = {
      workDuration: parseInt(workDuration, 10),
      breakDuration: parseInt(breakDuration, 10)
    }

    const success = updateSettings(newSettings)

    if (success) {
      onClose()
    } else {
      setErrors({
        general: 'Failed to save settings. Please try again.'
      })
    }

    setIsSubmitting(false)
  }

  const handleCancel = () => {
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2>Timer Settings</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label htmlFor="workDuration">
              Work Duration (minutes)
            </label>
            <input
              id="workDuration"
              type="text"
              inputMode="numeric"
              value={workDuration}
              onChange={handleWorkDurationChange}
              onBlur={handleWorkDurationBlur}
              className={errors.workDuration ? styles.inputError : ''}
              placeholder="Enter work duration (1-99)"
              disabled={isSubmitting}
            />
            {errors.workDuration && (
              <div className={styles.errorMessage}>
                {errors.workDuration}
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="breakDuration">
              Break Duration (minutes)
            </label>
            <input
              id="breakDuration"
              type="text"
              inputMode="numeric"
              value={breakDuration}
              onChange={handleBreakDurationChange}
              onBlur={handleBreakDurationBlur}
              className={errors.breakDuration ? styles.inputError : ''}
              placeholder="Enter break duration (1-99)"
              disabled={isSubmitting}
            />
            {errors.breakDuration && (
              <div className={styles.errorMessage}>
                {errors.breakDuration}
              </div>
            )}
          </div>

          {errors.general && (
            <div className={styles.errorMessage}>
              {errors.general}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}