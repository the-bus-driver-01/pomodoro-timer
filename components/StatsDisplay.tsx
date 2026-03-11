import React from 'react';

// CSS styles (to be extracted to a CSS module or styled-components in production)
const styles = `
  .stats-display {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .stats-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1.5rem 0;
    text-align: center;
  }

  .stats-grid {
    display: grid;
    gap: 1.25rem;
    grid-template-columns: 1fr;
  }

  /* Mobile-first responsive grid */
  @media (min-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .stats-display {
      padding: 2rem;
    }
  }

  @media (min-width: 1024px) {
    .stats-grid {
      gap: 1.5rem;
    }
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 1px solid #f3f4f6;
    transition: all 0.2s ease-in-out;
    min-height: 100px;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .stat-card--loading {
    pointer-events: none;
  }

  .stat-icon {
    font-size: 2rem;
    margin-right: 1rem;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
    min-width: 0;
  }

  .stat-value {
    font-size: 1.875rem;
    font-weight: 700;
    line-height: 1.2;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  .stat-unit {
    font-size: 1rem;
    font-weight: 400;
    color: #6b7280;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .stat-message {
    font-size: 0.75rem;
    color: #9ca3af;
    font-weight: 400;
    font-style: italic;
    margin-top: 0.25rem;
  }

  /* Error state styles */
  .error-state {
    text-align: center;
    padding: 2rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.75rem;
    margin: 1rem 0;
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #dc2626;
    margin-bottom: 0.5rem;
  }

  .error-message {
    color: #7f1d1d;
    margin-bottom: 1rem;
  }

  .retry-button {
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .retry-button:hover {
    background: #b91c1c;
  }

  .retry-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  /* Empty state styles */
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-message {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .empty-submessage {
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .stat-skeleton {
    height: 60px;
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 0.375rem;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* Color variants */
  .stat-card--blue .stat-value {
    color: #2563eb;
  }

  .stat-card--green .stat-value {
    color: #059669;
  }

  .stat-card--orange .stat-value {
    color: #ea580c;
  }

  .stat-card--blue {
    border-left: 4px solid #2563eb;
  }

  .stat-card--green {
    border-left: 4px solid #059669;
  }

  .stat-card--orange {
    border-left: 4px solid #ea580c;
  }
`;

// Interface for individual stat data
export interface StatData {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: string;
}

// Interface for daily stats
export interface DailyStats {
  focusTime: number; // in minutes
  sessionsCompleted: number;
  currentStreak: number; // in days
}

// Component props interface
export interface StatsDisplayProps {
  stats?: DailyStats;
  isLoading?: boolean;
  error?: string;
  className?: string;
  onRetry?: () => void;
}

// Individual stat card props
interface StatCardProps {
  stat: StatData;
  isLoading?: boolean;
}

// Helper functions for data formatting

/**
 * Formats time from minutes to human-readable format
 */
const formatTime = (minutes: number): string => {
  if (minutes === 0) return '0m';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
};

/**
 * Formats session count with proper plural handling
 */
const formatSessions = (count: number): { value: string; unit: string } => {
  return {
    value: count.toString(),
    unit: count === 1 ? ' session' : ' sessions'
  };
};

/**
 * Formats streak with motivational messaging
 */
const formatStreak = (days: number): { value: string; unit: string; message?: string } => {
  let message = '';

  if (days === 0) {
    message = 'Start your streak!';
  } else if (days === 1) {
    message = 'Great start!';
  } else if (days >= 7) {
    message = 'Amazing streak!';
  } else if (days >= 30) {
    message = 'Incredible dedication!';
  }

  return {
    value: days.toString(),
    unit: days === 1 ? ' day' : ' days',
    message
  };
};

/**
 * Formats a time value into display format
 */
const formatTimeDisplay = (minutes: number): { value: string; unit: string } => {
  const formatted = formatTime(minutes);
  return {
    value: formatted,
    unit: ''
  };
};

/**
 * Gets appropriate emoji based on streak length
 */
const getStreakEmoji = (days: number): string => {
  if (days === 0) return '💪';
  if (days < 3) return '🔥';
  if (days < 7) return '🚀';
  if (days < 30) return '⭐';
  return '👑';
};

/**
 * Validates stats data
 */
const validateStats = (stats: DailyStats | undefined): boolean => {
  if (!stats) return false;

  return (
    typeof stats.focusTime === 'number' &&
    typeof stats.sessionsCompleted === 'number' &&
    typeof stats.currentStreak === 'number' &&
    stats.focusTime >= 0 &&
    stats.sessionsCompleted >= 0 &&
    stats.currentStreak >= 0
  );
};

/**
 * Checks if stats data is empty (all zeros)
 */
const isStatsEmpty = (stats: DailyStats | undefined): boolean => {
  if (!stats) return true;
  return stats.focusTime === 0 && stats.sessionsCompleted === 0 && stats.currentStreak === 0;
};

// Error state component
const ErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div className="error-state">
    <div className="error-icon">⚠️</div>
    <h3 className="error-title">Unable to Load Stats</h3>
    <p className="error-message">{error}</p>
    {onRetry && (
      <button className="retry-button" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

// Empty state component
const EmptyState: React.FC = () => (
  <div className="empty-state">
    <div className="empty-icon">📊</div>
    <p className="empty-message">No activity yet today</p>
    <p className="empty-submessage">Start a focus session to see your stats!</p>
  </div>
);

// Enhanced StatCard component with better formatting
const StatCard: React.FC<StatCardProps> = ({ stat, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="stat-card stat-card--loading">
        <div className="stat-skeleton"></div>
      </div>
    );
  }

  return (
    <div className={`stat-card stat-card--${stat.color || 'default'}`}>
      <div className="stat-icon" aria-hidden="true">
        {stat.icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">
          {stat.value}
          {stat.unit && <span className="stat-unit">{stat.unit}</span>}
        </div>
        <div className="stat-label">{stat.label}</div>
        {/* Add motivational message for streaks */}
        {stat.label === 'Current Streak' && (stat as any).message && (
          <div className="stat-message">
            {(stat as any).message}
          </div>
        )}
      </div>
    </div>
  );
};

// Base StatsDisplay component
const StatsDisplay: React.FC<StatsDisplayProps> = ({
  stats,
  isLoading = false,
  error,
  className = '',
  onRetry
}) => {
  // Handle error state
  if (error) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className={`stats-display ${className}`}>
          <h2 className="stats-title">Daily Stats</h2>
          <ErrorState error={error} onRetry={onRetry} />
        </div>
      </>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className={`stats-display ${className}`}>
          <h2 className="stats-title">Daily Stats</h2>
          <div className="stats-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <StatCard
                key={index}
                stat={{ label: '', value: 0 }}
                isLoading={true}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  // Validate stats data
  if (!validateStats(stats)) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className={`stats-display ${className}`}>
          <h2 className="stats-title">Daily Stats</h2>
          <ErrorState
            error="Invalid stats data received"
            onRetry={onRetry}
          />
        </div>
      </>
    );
  }

  // Handle empty state
  if (isStatsEmpty(stats)) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className={`stats-display ${className}`}>
          <h2 className="stats-title">Daily Stats</h2>
          <EmptyState />
        </div>
      </>
    );
  }

  // Create stat data objects with proper formatting
  const focusTimeData = formatTimeDisplay(stats!.focusTime);
  const sessionsData = formatSessions(stats!.sessionsCompleted);
  const streakData = formatStreak(stats!.currentStreak);

  const statsData: (StatData & { message?: string })[] = [
    {
      label: 'Focus Time',
      value: focusTimeData.value,
      unit: focusTimeData.unit,
      icon: '⏱️',
      color: 'blue'
    },
    {
      label: 'Sessions',
      value: sessionsData.value,
      unit: sessionsData.unit,
      icon: '📋',
      color: 'green'
    },
    {
      label: 'Current Streak',
      value: streakData.value,
      unit: streakData.unit,
      icon: getStreakEmoji(stats!.currentStreak),
      color: 'orange',
      message: streakData.message
    }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className={`stats-display ${className}`}>
        <h2 className="stats-title">Daily Stats</h2>
        <div className="stats-grid">
          {statsData.map((statData) => (
            <StatCard
              key={statData.label}
              stat={statData}
              isLoading={false}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default StatsDisplay;