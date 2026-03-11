# Session History Tracking

This module provides session history tracking functionality for a Pomodoro timer application.

## Features

- ✅ Track work and break sessions with duration and timestamps
- ✅ Persist session data to localStorage
- ✅ Filter sessions by date and type
- ✅ React hook for easy integration
- ✅ Error handling for localStorage quota limits
- ✅ TypeScript support with comprehensive type definitions

## Usage

### React Hook

```typescript
import { useSessionHistory } from './hooks/useSessionHistory';

function MyComponent() {
  const { addSession, getHistory, clearHistory, sessions } = useSessionHistory();

  // Add a 25-minute work session
  const handleWorkComplete = () => {
    addSession('work', 1500); // 25 minutes in seconds
  };

  // Get today's sessions
  const todaySessions = getHistory({ date: '2024-01-15' });

  return (
    <div>
      <button onClick={handleWorkComplete}>Complete Work Session</button>
      <button onClick={clearHistory}>Clear History</button>
      <p>Total sessions: {sessions.length}</p>
    </div>
  );
}
```

### Direct Service Usage

```typescript
import { addSessionRecord, getSessionHistory, clearSessionHistory } from './services/sessionHistoryService';

// Add a session
addSessionRecord('work', 1500);

// Get all sessions
const allSessions = getSessionHistory();

// Get sessions from a specific date
const todaySessions = getSessionHistory({ date: '2024-01-15' });

// Clear all history
clearSessionHistory();
```

## API Reference

### Types

```typescript
type SessionType = 'work' | 'break';

interface SessionRecord {
  type: SessionType;
  duration: number;      // Duration in seconds
  timestamp: string;     // ISO timestamp
  date: string;         // Date in YYYY-MM-DD format
}
```

### Service Functions

- `addSessionRecord(type, duration)` - Add a new session
- `getSessionHistory(filter?)` - Get sessions with optional filtering
- `clearSessionHistory()` - Clear all session data
- `isStorageAvailable()` - Check if localStorage is available

### React Hook

- `useSessionHistory()` - Returns `{ sessions, addSession, getHistory, clearHistory, isStorageAvailable }`

## Acceptance Criteria Coverage

1. ✅ **Session completion recording**: `addSession('work', 1500)` creates record with type, duration, timestamp, and date
2. ✅ **History retrieval**: `getHistory()` returns all sessions in chronological order
3. ✅ **Date filtering**: `getHistory({ date: '2024-01-15' })` filters by specific date
4. ✅ **Persistence**: Data persists across page refreshes via localStorage
5. ✅ **Storage quota handling**: Graceful degradation with warnings when approaching quota limits
6. ✅ **Clear history**: `clearHistory()` removes all session records

## Error Handling

- localStorage quota exceeded: Session saves fail gracefully with error logging
- Data corruption: Invalid data is reset with warnings
- Storage unavailable: Fallback behavior with console warnings
- JSON parsing errors: Handled with error recovery