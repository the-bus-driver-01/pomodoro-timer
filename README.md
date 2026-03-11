# Task Management Hook

A React hook for managing tasks with localStorage persistence and TypeScript support.

## Features

- ✅ Complete CRUD operations (Create, Read, Update, Delete)
- ✅ localStorage persistence
- ✅ TypeScript support with comprehensive interfaces
- ✅ React state management with automatic re-rendering
- ✅ Performance optimized with useCallback
- ✅ Error handling and graceful fallbacks
- ✅ Loading state management
- ✅ Utility functions for enhanced functionality

## Usage

```typescript
import useTaskManager from './hooks/useTaskManager';

function MyTaskComponent() {
  const {
    tasks,
    loading,
    addTask,
    editTask,
    deleteTask,
    getTasks,
    getTaskById,
    toggleTaskComplete,
    getTasksByStatus
  } = useTaskManager();

  const handleAddTask = () => {
    addTask('New Task', 'Task description');
  };

  const handleEditTask = (id: string) => {
    editTask(id, { title: 'Updated Title' });
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const handleToggleComplete = (id: string) => {
    toggleTaskComplete(id);
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      <h1>My Tasks ({tasks.length})</h1>

      <button onClick={handleAddTask}>Add Task</button>

      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>Status: {task.completed ? 'Completed' : 'Pending'}</p>
          <button onClick={() => handleEditTask(task.id)}>Edit</button>
          <button onClick={() => handleToggleComplete(task.id)}>
            {task.completed ? 'Mark Pending' : 'Mark Complete'}
          </button>
          <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### Hook Return Value

```typescript
interface TaskManager {
  tasks: Task[];
  loading: boolean;
  addTask: (title: string, description: string) => void;
  editTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  getTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  toggleTaskComplete: (id: string) => void;
  getTasksByStatus: (completed: boolean) => Task[];
}
```

### Task Interface

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Functions

- **`addTask(title, description)`** - Creates a new task
- **`editTask(id, updates)`** - Updates an existing task
- **`deleteTask(id)`** - Removes a task
- **`getTasks()`** - Returns all tasks
- **`getTaskById(id)`** - Finds a specific task
- **`toggleTaskComplete(id)`** - Toggles task completion status
- **`getTasksByStatus(completed)`** - Filters tasks by completion status

## Storage

Tasks are automatically persisted to localStorage under the key `"tasks"`. The hook handles:
- Automatic loading on initialization
- Immediate saving after any changes
- JSON serialization/deserialization
- Date object conversion
- Error handling for storage failures

## Test Component

See `TestTaskComponent.tsx` for a complete example demonstrating all functionality.
