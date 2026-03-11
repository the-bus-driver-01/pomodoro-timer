import React from 'react';
import StatsDisplay, { DailyStats } from './StatsDisplay';

// Test data for different scenarios
const mockStatsData: DailyStats = {
  focusTime: 125, // 2h 5m
  sessionsCompleted: 3,
  currentStreak: 7
};

const emptyStatsData: DailyStats = {
  focusTime: 0,
  sessionsCompleted: 0,
  currentStreak: 0
};

const singleSessionStats: DailyStats = {
  focusTime: 25, // 25 minutes
  sessionsCompleted: 1,
  currentStreak: 1
};

const highStreakStats: DailyStats = {
  focusTime: 480, // 8 hours
  sessionsCompleted: 16,
  currentStreak: 45
};

// Example usage component demonstrating all states
const StatsDisplayExample: React.FC = () => {
  const [selectedExample, setSelectedExample] = React.useState<string>('normal');
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const getCurrentStats = (): DailyStats | undefined => {
    switch (selectedExample) {
      case 'empty':
        return emptyStatsData;
      case 'single':
        return singleSessionStats;
      case 'high-streak':
        return highStreakStats;
      case 'normal':
      default:
        return mockStatsData;
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const simulateError = () => {
    setHasError(true);
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>StatsDisplay Component Examples</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setSelectedExample('normal')}>
          Normal Stats
        </button>
        <button onClick={() => setSelectedExample('empty')}>
          Empty Stats
        </button>
        <button onClick={() => setSelectedExample('single')}>
          Single Session
        </button>
        <button onClick={() => setSelectedExample('high-streak')}>
          High Streak
        </button>
        <button onClick={simulateLoading}>
          Loading State
        </button>
        <button onClick={simulateError}>
          Error State
        </button>
      </div>

      <StatsDisplay
        stats={getCurrentStats()}
        isLoading={isLoading}
        error={hasError ? 'Failed to load stats data. Please try again.' : undefined}
        onRetry={handleRetry}
      />

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3>Usage Examples:</h3>
        <pre style={{ backgroundColor: '#1f2937', color: '#f9fafb', padding: '16px', borderRadius: '8px', overflow: 'auto' }}>
{`// Basic usage
<StatsDisplay stats={{
  focusTime: 125, // 2h 5m
  sessionsCompleted: 3,
  currentStreak: 7
}} />

// With loading state
<StatsDisplay isLoading={true} />

// With error handling
<StatsDisplay
  error="Failed to load data"
  onRetry={() => fetchStats()}
/>

// Empty state
<StatsDisplay stats={{
  focusTime: 0,
  sessionsCompleted: 0,
  currentStreak: 0
}} />`}
        </pre>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <h3>Component Features:</h3>
        <ul>
          <li>✅ TypeScript interfaces for type safety</li>
          <li>✅ Responsive grid layout (1 column → 2 columns → 3 columns)</li>
          <li>✅ Visual indicators with emojis and colors</li>
          <li>✅ Smart time formatting (125m → 2h 5m)</li>
          <li>✅ Plural handling for sessions (1 session vs 2 sessions)</li>
          <li>✅ Motivational streak messages</li>
          <li>✅ Loading states with skeleton animations</li>
          <li>✅ Error handling with retry functionality</li>
          <li>✅ Empty state messaging</li>
          <li>✅ Hover effects and smooth animations</li>
          <li>✅ Accessible design with proper ARIA labels</li>
        </ul>
      </div>
    </div>
  );
};

export default StatsDisplayExample;