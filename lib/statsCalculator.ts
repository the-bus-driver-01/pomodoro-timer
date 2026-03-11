// Session data structure expected in localStorage
export interface Session {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  duration: number; // Duration in minutes
  completed: boolean;
  timestamp: number; // Unix timestamp when session was created
}

// Stats interface
export interface DayStats {
  totalFocusTime: number; // Total focus time in minutes for the day
  sessionsCompleted: number; // Number of completed sessions for the day
  currentStreak: number; // Current streak of consecutive days with completed sessions
}

/**
 * Get session data from localStorage
 */
function getSessionData(): Session[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const data = localStorage.getItem('pomodoroSessions');
  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data) as Session[];
  } catch (error) {
    console.error('Error parsing session data from localStorage:', error);
    return [];
  }
}

/**
 * Get the current date in YYYY-MM-DD format
 */
function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get sessions for a specific date
 */
function getSessionsForDate(sessions: Session[], date: string): Session[] {
  return sessions.filter(session => session.date === date);
}

/**
 * Calculate total focus time for completed sessions on a given date
 */
export function calculateTotalFocusTime(sessions: Session[], date: string): number {
  const daySessions = getSessionsForDate(sessions, date);
  return daySessions
    .filter(session => session.completed)
    .reduce((total, session) => total + session.duration, 0);
}

/**
 * Calculate number of completed sessions for a given date
 */
export function calculateSessionsCompleted(sessions: Session[], date: string): number {
  const daySessionsCount = getSessionsForDate(sessions, date);
  return daySessionsCount.filter(session => session.completed).length;
}

/**
 * Calculate current streak of consecutive days with completed sessions
 * Streak starts from today and goes backwards
 */
export function calculateCurrentStreak(sessions: Session[]): number {
  const today = getCurrentDateString();
  const todayDate = new Date(today);
  let streak = 0;
  let currentDate = new Date(todayDate);

  // Group sessions by date for efficient lookup
  const sessionsByDate = new Map<string, Session[]>();
  sessions.forEach(session => {
    const date = session.date;
    if (!sessionsByDate.has(date)) {
      sessionsByDate.set(date, []);
    }
    sessionsByDate.get(date)!.push(session);
  });

  // Count backwards from today
  while (true) {
    const dateString = currentDate.toISOString().split('T')[0];
    const daySessions = sessionsByDate.get(dateString) || [];
    const hasCompletedSession = daySessions.some(session => session.completed);

    if (hasCompletedSession) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // If this is not today and there's no completed session, break the streak
      // If this is today, we still count the streak even if no sessions today
      if (dateString !== today) {
        break;
      } else {
        // Move to previous day to continue checking
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }
  }

  return streak;
}

/**
 * Get comprehensive stats for the current day
 */
export function getCurrentDayStats(): DayStats {
  const sessions = getSessionData();
  const today = getCurrentDateString();

  return {
    totalFocusTime: calculateTotalFocusTime(sessions, today),
    sessionsCompleted: calculateSessionsCompleted(sessions, today),
    currentStreak: calculateCurrentStreak(sessions)
  };
}

/**
 * Get stats for a specific date
 */
export function getStatsForDate(date: string): DayStats {
  const sessions = getSessionData();

  return {
    totalFocusTime: calculateTotalFocusTime(sessions, date),
    sessionsCompleted: calculateSessionsCompleted(sessions, date),
    currentStreak: calculateCurrentStreak(sessions)
  };
}

/**
 * Utility function to format focus time in a human-readable format
 */
export function formatFocusTime(minutes: number): string {
  if (minutes === 0) {
    return '0 minutes';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
}