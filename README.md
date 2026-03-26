# Pomodoro Timer

A simple pomodoro timer web app built with Next.js and a custom React hook for timer state management.

## Features

- ⏱️ Custom `useTimer` hook for timer state management
- 🍅 25-minute work sessions (default)
- ☕ 5-minute break sessions (default)
- 🔄 Automatic session switching
- ⚙️ Customizable intervals via localStorage
- ▶️ Start, pause, and reset controls
- 📱 Responsive design

## Timer Hook API

### Usage

```typescript
import { useTimer } from '@/hooks';

function MyComponent() {
  const { elapsed, duration, sessionType, isRunning, start, pause, reset } = useTimer();

  // Your component logic here
}
```

### Return Values

- `elapsed`: Number of milliseconds elapsed in current session
- `duration`: Total duration of current session in seconds
- `sessionType`: Either 'work' or 'break'
- `isRunning`: Boolean indicating if timer is running
- `start()`: Function to start the timer
- `pause()`: Function to pause the timer
- `reset()`: Function to reset elapsed time to 0 and stop timer

### Custom Intervals

Set custom intervals in localStorage:

```javascript
// Set work session to 30 minutes
localStorage.setItem('work-interval', '30');

// Set break session to 10 minutes
localStorage.setItem('break-interval', '10');
```

## Acceptance Criteria Met

1. ✅ Hook initializes with default settings (25 min work, 5 min break)
2. ✅ Timer increments elapsed time by ~100ms when running
3. ✅ Session toggles and elapsed resets when duration reached
4. ✅ start() function sets isRunning to true and starts timer
5. ✅ pause() function sets isRunning to false and stops timer
6. ✅ reset() function resets elapsed to 0 and stops timer
7. ✅ Custom intervals loaded from localStorage with fallback to defaults

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## File Structure

```
src/
├── hooks/
│   ├── useTimer.ts          # Main timer hook implementation
│   ├── index.ts             # Hook exports
│   └── __tests__/
│       └── useTimer.test.ts # Comprehensive tests
├── components/
│   └── Timer.tsx            # Demo timer component
└── app/
    ├── layout.tsx           # App layout
    └── page.tsx             # Main page
```
