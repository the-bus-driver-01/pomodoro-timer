# Stats Calculator

This module provides statistics calculation functions for the Pomodoro Timer application.

## Overview

The `statsCalculator.ts` module calculates daily statistics based on session data stored in localStorage.

## Data Structure

The calculator expects session data in the following format:

```typescript
interface Session {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  duration: number; // Duration in minutes
  completed: boolean;
  timestamp: number; // Unix timestamp when session was created
}
```

## Functions

### Main Functions

- `getCurrentDayStats()` - Returns comprehensive stats for the current day
- `getStatsForDate(date: string)` - Returns stats for a specific date

### Calculation Functions

- `calculateTotalFocusTime(sessions, date)` - Total focus time from completed sessions
- `calculateSessionsCompleted(sessions, date)` - Number of completed sessions
- `calculateCurrentStreak(sessions)` - Current streak of consecutive days with completed sessions

### Utility Functions

- `formatFocusTime(minutes)` - Formats time in human-readable format

## Usage Example

```typescript
import { getCurrentDayStats, formatFocusTime } from './lib/statsCalculator';

// Get today's stats
const stats = getCurrentDayStats();
console.log(`Focus time: ${formatFocusTime(stats.totalFocusTime)}`);
console.log(`Sessions completed: ${stats.sessionsCompleted}`);
console.log(`Current streak: ${stats.currentStreak} days`);
```

## localStorage Key

The calculator reads session data from localStorage using the key `'pomodoroSessions'`.

## Features

- **Server-side safe**: Handles cases where `window` is undefined
- **Error handling**: Gracefully handles corrupted localStorage data
- **Flexible**: Can calculate stats for any date, not just today
- **Streak calculation**: Counts consecutive days with at least one completed session
- **Time formatting**: Provides human-readable time formatting