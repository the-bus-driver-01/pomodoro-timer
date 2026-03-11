/**
 * Test file to verify type imports work correctly
 * This demonstrates usage of the defined types and interfaces
 */

import {
  Timer,
  Task,
  Session,
  Stats,
  AppState,
  Priority,
  SessionType,
  TimerState,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
  SessionFilters,
  TaskFilters,
  isPriority,
  isSessionType,
} from './index';

// Test creating task input
const newTask: CreateTaskInput = {
  title: 'Complete project documentation',
  description: 'Write comprehensive docs for the project',
  status: 'pending',
  priority: 'high',
  completed: false,
  actualDuration: 0,
  pomodoroCount: 0,
  tags: ['documentation', 'project'],
  project: 'Main Project'
};

// Test type guards
function validatePriority(priority: string): Priority | null {
  return isPriority(priority) ? priority : null;
}

function validateSessionType(type: string): SessionType | null {
  return isSessionType(type) ? type : null;
}

// Test filters
const taskFilters: TaskFilters = {
  status: 'inProgress',
  priority: 'high',
  tags: ['urgent']
};

const sessionFilters: SessionFilters = {
  type: 'work',
  completed: true,
  minDuration: 25
};

// Example usage in a function
function createTimer(sessionType: SessionType): Omit<Timer, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    startTime: new Date(),
    endTime: null,
    duration: 0,
    state: 'idle',
    isActive: false,
    isPaused: false,
    sessionType
  };
}

export {
  newTask,
  validatePriority,
  validateSessionType,
  taskFilters,
  sessionFilters,
  createTimer
};