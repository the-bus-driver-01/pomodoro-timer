# Local Storage Service

A comprehensive TypeScript service for managing application data in browser localStorage with full CRUD operations, data validation, and error handling.

## Features

- ✅ **Complete CRUD Operations** for Tasks, Sessions, Settings, and Stats
- ✅ **TypeScript Support** with comprehensive type definitions
- ✅ **Data Validation** with runtime type checking
- ✅ **Error Handling** with custom StorageError class
- ✅ **Default Values** and graceful fallbacks
- ✅ **Storage Utilities** for quota management and availability checking
- ✅ **Browser Compatibility** works across modern browsers

## Quick Start

```typescript
import { taskStorage, sessionStorage, settingsStorage, statsStorage } from './lib/storage';

// Create a new task
taskStorage.addTask({
  id: 'task-1',
  title: 'My First Task',
  completed: false,
  priority: 'high',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Get all tasks
const tasks = taskStorage.getTasks();

// Update settings
settingsStorage.updateSettings({
  theme: 'dark',
  focusTime: 30
});
```

## Data Types

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags?: string[];
}
```

### Session
```typescript
interface Session {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in milliseconds
  taskId?: string;
  type: 'focus' | 'break' | 'meeting';
  notes?: string;
  metadata?: Record<string, any>;
}
```

### Settings
```typescript
interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoSave: boolean;
  focusTime: number; // in minutes
  breakTime: number; // in minutes
  language: string;
  timezone: string;
  preferences?: Record<string, any>;
}
```

### Stats
```typescript
interface Stats {
  totalTasks: number;
  completedTasks: number;
  totalSessions: number;
  totalFocusTime: number; // in milliseconds
  streakDays: number;
  lastActive: string;
  dailyStats?: Record<string, {
    tasksCompleted: number;
    focusTime: number;
    sessions: number;
  }>;
}
```

## API Reference

### Task Storage

| Method | Description | Returns |
|--------|-------------|---------|
| `getTasks()` | Get all tasks | `Task[]` |
| `setTasks(tasks)` | Set all tasks | `void` |
| `addTask(task)` | Add a new task | `void` |
| `updateTask(id, updates)` | Update existing task | `void` |
| `deleteTask(id)` | Delete a task | `void` |
| `clearTasks()` | Clear all tasks | `void` |

### Session Storage

| Method | Description | Returns |
|--------|-------------|---------|
| `getSessions()` | Get all sessions | `Session[]` |
| `setSessions(sessions)` | Set all sessions | `void` |
| `addSession(session)` | Add a new session | `void` |
| `updateSession(id, updates)` | Update existing session | `void` |
| `deleteSession(id)` | Delete a session | `void` |
| `clearSessions()` | Clear all sessions | `void` |

### Settings Storage

| Method | Description | Returns |
|--------|-------------|---------|
| `getSettings()` | Get settings with defaults | `Settings` |
| `setSettings(settings)` | Set all settings | `void` |
| `updateSettings(updates)` | Update specific settings | `void` |
| `resetSettings()` | Reset to defaults | `void` |

### Stats Storage

| Method | Description | Returns |
|--------|-------------|---------|
| `getStats()` | Get stats with defaults | `Stats` |
| `setStats(stats)` | Set all stats | `void` |
| `updateStats(updates)` | Update specific stats | `void` |
| `incrementStat(key, amount)` | Increment a stat | `void` |
| `addFocusTime(milliseconds)` | Add to focus time | `void` |
| `resetStats()` | Reset to defaults | `void` |

### Utility Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `isStorageAvailable()` | Check if localStorage works | `boolean` |
| `getStorageInfo()` | Get usage information | `{used: number, available: boolean}` |
| `clearAllAppData()` | Clear all app data | `void` |

## Error Handling

The service uses a custom `StorageError` class for consistent error handling:

```typescript
import { StorageError } from './lib/storage';

try {
  taskStorage.addTask(newTask);
} catch (error) {
  if (error instanceof StorageError) {
    console.error('Storage operation failed:', error.message);

    if (error.message.includes('quota exceeded')) {
      // Handle storage quota exceeded
      alert('Storage is full. Please clear some data.');
    }
  }
}
```

## Data Validation

All data is validated before being stored:

- **Type checking** ensures data structure integrity
- **Required fields** validation prevents incomplete data
- **Enum validation** for constrained fields (priority, theme, etc.)
- **Automatic cleanup** filters out invalid entries

## Storage Keys

The service uses consistent localStorage keys:

- `app_tasks` - Task data
- `app_sessions` - Session data
- `app_settings` - Settings data
- `app_stats` - Statistics data

## Browser Compatibility

- ✅ Chrome 4+
- ✅ Firefox 3.5+
- ✅ Safari 4+
- ✅ Edge 12+
- ✅ iOS Safari 3.2+
- ✅ Android Browser 2.1+

## Usage Patterns

### Component Integration

```typescript
// React component example
import { taskStorage, type Task } from './lib/storage';
import { useState, useEffect } from 'react';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Load tasks on component mount
    const loadedTasks = taskStorage.getTasks();
    setTasks(loadedTasks);
  }, []);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title,
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    taskStorage.addTask(newTask);
    setTasks(taskStorage.getTasks()); // Refresh state
  };

  const toggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      taskStorage.updateTask(taskId, {
        completed: !task.completed
      });
      setTasks(taskStorage.getTasks()); // Refresh state
    }
  };

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id} onClick={() => toggleTask(task.id)}>
          {task.title} - {task.completed ? '✅' : '⏳'}
        </div>
      ))}
    </div>
  );
}
```

### Data Persistence

Data persists across browser sessions automatically:

```typescript
// Set data
taskStorage.addTask({...});
settingsStorage.updateSettings({theme: 'dark'});

// Close browser, reopen...

// Data is still there
const tasks = taskStorage.getTasks(); // Previously saved tasks
const settings = settingsStorage.getSettings(); // Theme is still 'dark'
```

### Backup and Restore

```typescript
import { AppDataManager } from './lib/usage-example';

// Export all data
const backup = AppDataManager.exportData();
localStorage.setItem('app_backup', backup);

// Import data (e.g., from file upload)
const backupData = localStorage.getItem('app_backup');
if (backupData) {
  AppDataManager.importData(backupData);
}
```

## Development

The service is implemented in a single TypeScript file (`lib/storage.ts`) with:

- **No external dependencies**
- **Comprehensive JSDoc comments**
- **Full TypeScript types**
- **Extensive error handling**
- **Performance optimized**

## Testing

Run the included test file to verify functionality:

```bash
cd lib
node storage-test.js
```

## License

This local storage service is part of your application and follows your project's licensing terms.