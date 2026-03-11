# Task-Session Linking Module

A TypeScript module that provides functionality to link pomodoro sessions to tasks and manage the relationships between sessions and tasks. This enables users to track which tasks they worked on during specific pomodoro sessions, providing insights into productivity and time allocation.

## Features

- ✅ Link completed pomodoro sessions to specific tasks
- ✅ Query sessions by task ID with sorting and filtering options
- ✅ Get task information for any linked session
- ✅ Complete sessions and link them to tasks in one operation
- ✅ Comprehensive error handling with custom error types
- ✅ Full TypeScript support with strict type checking
- ✅ In-memory storage with extensible storage interface
- ✅ Extensive test coverage

## Installation

```typescript
import {
  linkSessionToTask,
  getSessionsByTaskId,
  completeSessionWithTask,
  // ... other functions
} from './lib/sessionTaskLink';
```

## Quick Start

```typescript
import { addTask, addSession, linkSessionToTask } from './lib/sessionTaskLink';

// Create a task
const task = {
  id: 'task-1',
  title: 'Implement user authentication',
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
addTask(task);

// Create a session
const session = {
  id: 'session-1',
  startTime: new Date(),
  duration: 25,
  type: 'pomodoro' as const,
  completed: true,
  createdAt: new Date(),
};
addSession(session);

// Link session to task
const link = await linkSessionToTask('session-1', 'task-1', 'Worked on login functionality');
console.log(`Session linked at: ${link.linkedAt}`);
```

## API Reference

### Core Types

#### `Task`
Represents a task that can be worked on during pomodoro sessions.

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  estimatedPomodoros?: number;
}
```

#### `Session`
Represents a pomodoro session or break period.

```typescript
interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  type: 'pomodoro' | 'short_break' | 'long_break';
  completed: boolean;
  createdAt: Date;
}
```

#### `SessionTaskLink`
Represents a link between a session and a task.

```typescript
interface SessionTaskLink {
  sessionId: string;
  taskId: string;
  linkedAt: Date;
  notes?: string;
}
```

### Core Functions

#### `linkSessionToTask(sessionId, taskId, notes?)`
Links a session to a task.

```typescript
await linkSessionToTask('session-1', 'task-1', 'Implemented login form');
```

**Parameters:**
- `sessionId: string` - ID of the session to link
- `taskId: string` - ID of the task to link to
- `notes?: string` - Optional notes about the session

**Returns:** `Promise<SessionTaskLink>`

**Throws:** `SessionTaskLinkError` if validation fails or entities don't exist

#### `unlinkSession(sessionId)`
Removes the link for a session.

```typescript
const wasUnlinked = await unlinkSession('session-1');
```

**Parameters:**
- `sessionId: string` - ID of the session to unlink

**Returns:** `Promise<boolean>` - true if unlinked, false if not linked

#### `isSessionLinked(sessionId)`
Checks if a session is linked to any task.

```typescript
const isLinked = await isSessionLinked('session-1');
```

**Parameters:**
- `sessionId: string` - ID of the session to check

**Returns:** `Promise<boolean>`

### Query Functions

#### `getSessionsByTaskId(taskId, options?)`
Retrieves all sessions linked to a specific task.

```typescript
const sessions = await getSessionsByTaskId('task-1', {
  sortBy: 'startTime',
  sortOrder: 'desc',
  includeIncomplete: false
});
```

**Parameters:**
- `taskId: string` - ID of the task
- `options?: SessionQueryOptions` - Query options

**Returns:** `Promise<Session[]>`

#### `getTaskBySessionId(sessionId)`
Retrieves the task linked to a specific session.

```typescript
const task = await getTaskBySessionId('session-1');
```

**Parameters:**
- `sessionId: string` - ID of the session

**Returns:** `Promise<Task | null>`

#### `getAllLinkedSessions(options?)`
Retrieves all linked session information.

```typescript
const allLinked = await getAllLinkedSessions({
  sortBy: 'linkedAt',
  sortOrder: 'asc'
});
```

**Parameters:**
- `options?: SessionQueryOptions` - Query options

**Returns:** `Promise<LinkedSessionInfo[]>`

#### `getTaskSessionSummary(taskId)`
Retrieves summary information for a task including all linked sessions.

```typescript
const summary = await getTaskSessionSummary('task-1');
console.log(`Total time: ${summary?.totalDuration} minutes`);
```

**Parameters:**
- `taskId: string` - ID of the task

**Returns:** `Promise<TaskSessionSummary | null>`

### Session Completion

#### `completeSessionWithTask(sessionId, taskId, notes?)`
Completes a pomodoro session and links it to a task in one operation.

```typescript
const result = await completeSessionWithTask(
  'session-1',
  'task-1',
  'Finished implementing authentication'
);
console.log(`Session completed: ${result.session.completed}`);
console.log(`Linked at: ${result.link.linkedAt}`);
```

**Parameters:**
- `sessionId: string` - ID of the session to complete
- `taskId: string` - ID of the task to link to
- `notes?: string` - Optional notes about the session

**Returns:** `Promise<{ session: Session; link: SessionTaskLink }>`

## Query Options

### `SessionQueryOptions`
Options for filtering and sorting session queries.

```typescript
interface SessionQueryOptions {
  sortBy?: 'linkedAt' | 'startTime' | 'duration';
  sortOrder?: 'asc' | 'desc';
  includeIncomplete?: boolean;
}
```

## Error Handling

The module provides a custom `SessionTaskLinkError` class for handling specific error conditions:

```typescript
try {
  await linkSessionToTask('invalid-session', 'task-1');
} catch (error) {
  if (error instanceof SessionTaskLinkError) {
    console.log(`Error: ${error.message} (${error.code})`);
  }
}
```

### Error Codes

- `VALIDATION_ERROR` - Invalid input parameters
- `SESSION_NOT_FOUND` - Session doesn't exist
- `TASK_NOT_FOUND` - Task doesn't exist
- `ALREADY_LINKED` - Session is already linked to a task
- `ALREADY_COMPLETED` - Session is already completed
- `NOT_COMPLETABLE` - Session cannot be completed in its current state
- `MISSING_SESSION_ID` - Session ID is required but not provided

## Storage Management

The module includes utility functions for managing the in-memory storage:

```typescript
// Add entities to storage
addTask(task);
addSession(session);

// Retrieve entities
const task = getTask('task-1');
const session = getSession('session-1');

// Clear all data (useful for testing)
clearStorage();

// Get storage statistics
const stats = getStorageStats();
console.log(`Stored: ${stats.tasks} tasks, ${stats.sessions} sessions, ${stats.links} links`);
```

## Testing

The module includes a comprehensive test suite covering:

- Core linking operations
- Query functions with various options
- Session completion workflows
- Error handling and edge cases
- Storage management
- Concurrent operations

Run tests:
```bash
npm test
```

## TypeScript Support

The module is written in TypeScript with strict mode enabled and provides:

- Full type safety for all operations
- Comprehensive JSDoc documentation
- Type exports for all public interfaces
- Strict null checking and optional property handling

## License

MIT