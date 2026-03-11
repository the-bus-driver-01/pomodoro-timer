/**
 * Test scenarios for TimerDisplay component
 * These demonstrate all acceptance criteria being met
 */

import React from 'react'
import TimerDisplay from './TimerDisplay'

// Test Scenario 1: Basic 25-minute work session (AC #1)
export const WorkSession25MinStart = () => (
  <TimerDisplay
    elapsed={0}
    duration={1500}
    sessionType="work"
  />
)
// Expected: Displays '25:00' in large text with 'Work' label, blue/green theme

// Test Scenario 2: Work session with 10 minutes elapsed (AC #2)
export const WorkSession15MinRemaining = () => (
  <TimerDisplay
    elapsed={600}
    duration={1500}
    sessionType="work"
  />
)
// Expected: Displays '15:00' (25:00 - 10:00)

// Test Scenario 3: Completed break session (AC #3)
export const BreakSessionComplete = () => (
  <TimerDisplay
    elapsed={300}
    duration={300}
    sessionType="break"
  />
)
// Expected: Displays '00:00' with 'Break' label

// Test Scenario 4: Work session color verification (AC #4)
export const WorkSessionColors = () => (
  <TimerDisplay
    elapsed={0}
    duration={900}
    sessionType="work"
  />
)
// Expected: Blue/green color scheme

// Test Scenario 5: Break session color verification (AC #5)
export const BreakSessionColors = () => (
  <TimerDisplay
    elapsed={0}
    duration={300}
    sessionType="break"
  />
)
// Expected: Orange/yellow color scheme

// Test Scenario 6 & 7: Responsive font sizes (AC #6 & #7)
// The responsive behavior is handled by Tailwind CSS classes:
// - Mobile (< 640px): text-3xl (AC #6)
// - Small (≥ 640px): text-4xl (AC #6)
// - Desktop (≥ 768px): text-6xl (AC #7)
// - Large (≥ 1024px): text-7xl (AC #7)

export const ResponsiveFontExample = () => (
  <TimerDisplay
    elapsed={300}
    duration={1200}
    sessionType="work"
  />
)
// Expected: Font size adapts based on viewport:
// - text-3xl on mobile (< 640px)
// - text-4xl on small screens (≥ 640px)
// - text-6xl on medium screens (≥ 768px)
// - text-7xl on large screens (≥ 1024px)

// Additional edge case tests
export const ZeroTimeRemaining = () => (
  <TimerDisplay
    elapsed={1500}
    duration={1500}
    sessionType="work"
  />
)
// Expected: Displays '00:00'

export const OverElapsedTime = () => (
  <TimerDisplay
    elapsed={1800}
    duration={1500}
    sessionType="work"
  />
)
// Expected: Displays '00:00' (Math.max ensures no negative time)

/**
 * Manual Testing Instructions:
 *
 * 1. Import and render each scenario component
 * 2. Verify the displayed time matches expectations
 * 3. Check color schemes match session types
 * 4. Test responsive behavior by resizing browser window
 * 5. Verify labels are correct ('Work' vs 'Break')
 *
 * All scenarios should render correctly without errors.
 */