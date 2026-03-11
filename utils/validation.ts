/**
 * Validation utilities for settings panel
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateTimerDuration(value: string, fieldName: string): ValidationResult {
  // Check if empty
  if (!value.trim()) {
    return {
      isValid: false,
      error: `${fieldName} is required`
    }
  }

  // Check if numeric
  const numValue = parseFloat(value)
  if (isNaN(numValue) || !Number.isInteger(numValue)) {
    return {
      isValid: false,
      error: `${fieldName} must be a whole number`
    }
  }

  // Check range (1-99 minutes)
  if (numValue <= 0) {
    return {
      isValid: false,
      error: `${fieldName} must be greater than 0`
    }
  }

  if (numValue >= 100) {
    return {
      isValid: false,
      error: `${fieldName} must be less than 100`
    }
  }

  return { isValid: true }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}