# StatsDisplay Component

A responsive React component for displaying daily productivity statistics in a Pomodoro timer application.

## Features

- ✅ **TypeScript Support**: Fully typed with comprehensive interfaces
- ✅ **Responsive Design**: Mobile-first layout that adapts to all screen sizes
- ✅ **Visual Indicators**: Color-coded cards with emoji icons for each statistic
- ✅ **Smart Formatting**: Automatic time formatting (125m → 2h 5m), proper pluralization
- ✅ **Loading States**: Skeleton animations while data loads
- ✅ **Error Handling**: Graceful error states with retry functionality
- ✅ **Empty States**: Helpful messaging when no data is available
- ✅ **Motivational Messages**: Dynamic streak messages based on achievement level
- ✅ **Accessibility**: Proper ARIA labels and semantic HTML
- ✅ **Smooth Animations**: Hover effects and loading animations

## Usage

### Basic Usage
```tsx
import StatsDisplay, { DailyStats } from './components/StatsDisplay';

const stats: DailyStats = {
  focusTime: 125,        // 2h 5m
  sessionsCompleted: 3,
  currentStreak: 7
};

<StatsDisplay stats={stats} />
```

### With Loading State
```tsx
<StatsDisplay isLoading={true} />
```

### With Error Handling
```tsx
<StatsDisplay
  error="Failed to load statistics"
  onRetry={() => fetchStats()}
/>
```

### With Custom Styling
```tsx
<StatsDisplay
  stats={stats}
  className="my-custom-class"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stats` | `DailyStats \| undefined` | `undefined` | The statistics data to display |
| `isLoading` | `boolean` | `false` | Shows loading skeleton when true |
| `error` | `string \| undefined` | `undefined` | Error message to display |
| `onRetry` | `() => void \| undefined` | `undefined` | Callback for retry button |
| `className` | `string` | `''` | Additional CSS classes |

## Interfaces

### DailyStats
```typescript
interface DailyStats {
  focusTime: number;        // in minutes
  sessionsCompleted: number;
  currentStreak: number;    // in days
}
```

### StatData
```typescript
interface StatData {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: string;
}
```

## Responsive Breakpoints

- **Mobile**: 1 column grid (default)
- **Tablet** (640px+): 2 column grid
- **Desktop** (768px+): 3 column grid
- **Large screens** (1024px+): Increased spacing

## Customization

The component includes built-in CSS styles that can be overridden:

### Color Variants
- Blue: Focus time statistics
- Green: Session count statistics
- Orange: Streak statistics

### CSS Classes
- `.stats-display`: Main container
- `.stats-grid`: Grid layout container
- `.stat-card`: Individual stat card
- `.stat-card--{color}`: Color variants
- `.stat-skeleton`: Loading animation

## Data Validation

The component includes built-in validation:
- Checks for valid number types
- Ensures non-negative values
- Handles undefined/null data gracefully
- Provides appropriate fallbacks

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels for icons
- High contrast colors
- Keyboard navigation support

## Browser Support

- Modern browsers supporting CSS Grid
- ES2015+ JavaScript features
- React 16.8+ (hooks support)

## Development

To test the component:

```bash
# View the test examples
import StatsDisplayExample from './components/StatsDisplay.test';
```

The test file includes examples of all component states and usage patterns.