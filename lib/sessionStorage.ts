'use client';

import { SessionWithTask, PomodoroSession, Task, SessionStatus } from '@/types';

const SESSIONS_STORAGE_KEY = 'pomodoro_sessions';
const TASKS_STORAGE_KEY = 'pomodoro_tasks';

// Mock data for demonstration
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    name: 'Complete React Component',
    description: 'Build the session history component with responsive design',
    status: 'in_progress' as any,
    priority: 'high' as any,
    completedPomodoros: 2,
    estimatedPomodoros: 4,
    createdAt: new Date('2024-03-10T10:00:00'),
    updatedAt: new Date('2024-03-11T14:30:00'),
    tags: ['development', 'react', 'frontend'],
  },
  {
    id: '2',
    name: 'Write API Documentation',
    description: 'Document the REST API endpoints for the Pomodoro app',
    status: 'todo' as any,
    priority: 'medium' as any,
    completedPomodoros: 0,
    estimatedPomodoros: 3,
    createdAt: new Date('2024-03-09T15:30:00'),
    updatedAt: new Date('2024-03-09T15:30:00'),
    tags: ['documentation', 'api'],
  },
  {
    id: '3',
    name: 'Fix Authentication Bug',
    description: 'Resolve the issue with token expiration handling',
    status: 'completed' as any,
    priority: 'high' as any,
    completedPomodoros: 3,
    estimatedPomodoros: 2,
    createdAt: new Date('2024-03-08T09:00:00'),
    updatedAt: new Date('2024-03-11T11:45:00'),
    tags: ['bugfix', 'auth', 'security'],
  },
  {
    id: '4',
    name: 'Plan Sprint Review',
    description: 'Prepare presentation materials for the sprint review meeting',
    status: 'in_progress' as any,
    priority: 'medium' as any,
    completedPomodoros: 1,
    estimatedPomodoros: 2,
    createdAt: new Date('2024-03-11T08:00:00'),
    updatedAt: new Date('2024-03-11T12:15:00'),
    tags: ['planning', 'meeting'],
  },
];

const MOCK_SESSIONS: PomodoroSession[] = [
  // Today's sessions
  {
    id: '1',
    taskId: '1',
    startTime: new Date('2024-03-11T09:00:00'),
    endTime: new Date('2024-03-11T09:25:00'),
    duration: 25 * 60 * 1000, // 25 minutes
    status: SessionStatus.COMPLETED,
    type: 'work',
    createdAt: new Date('2024-03-11T09:00:00'),
    updatedAt: new Date('2024-03-11T09:25:00'),
  },
  {
    id: '2',
    taskId: '1',
    startTime: new Date('2024-03-11T09:30:00'),
    endTime: new Date('2024-03-11T09:35:00'),
    duration: 5 * 60 * 1000, // 5 minutes
    status: SessionStatus.COMPLETED,
    type: 'short_break',
    createdAt: new Date('2024-03-11T09:30:00'),
    updatedAt: new Date('2024-03-11T09:35:00'),
  },
  {
    id: '3',
    taskId: '3',
    startTime: new Date('2024-03-11T10:00:00'),
    endTime: new Date('2024-03-11T10:18:00'),
    duration: 18 * 60 * 1000, // 18 minutes (interrupted)
    status: SessionStatus.INTERRUPTED,
    type: 'work',
    createdAt: new Date('2024-03-11T10:00:00'),
    updatedAt: new Date('2024-03-11T10:18:00'),
  },
  {
    id: '4',
    taskId: '4',
    startTime: new Date('2024-03-11T14:00:00'),
    endTime: null,
    duration: 15 * 60 * 1000, // 15 minutes so far
    status: SessionStatus.IN_PROGRESS,
    type: 'work',
    createdAt: new Date('2024-03-11T14:00:00'),
    updatedAt: new Date('2024-03-11T14:15:00'),
  },

  // Yesterday's sessions
  {
    id: '5',
    taskId: '1',
    startTime: new Date('2024-03-10T10:30:00'),
    endTime: new Date('2024-03-10T10:55:00'),
    duration: 25 * 60 * 1000,
    status: SessionStatus.COMPLETED,
    type: 'work',
    createdAt: new Date('2024-03-10T10:30:00'),
    updatedAt: new Date('2024-03-10T10:55:00'),
  },
  {
    id: '6',
    taskId: '1',
    startTime: new Date('2024-03-10T11:00:00'),
    endTime: new Date('2024-03-10T11:05:00'),
    duration: 5 * 60 * 1000,
    status: SessionStatus.COMPLETED,
    type: 'short_break',
    createdAt: new Date('2024-03-10T11:00:00'),
    updatedAt: new Date('2024-03-10T11:05:00'),
  },
  {
    id: '7',
    taskId: '2',
    startTime: new Date('2024-03-10T15:00:00'),
    endTime: new Date('2024-03-10T15:25:00'),
    duration: 25 * 60 * 1000,
    status: SessionStatus.COMPLETED,
    type: 'work',
    createdAt: new Date('2024-03-10T15:00:00'),
    updatedAt: new Date('2024-03-10T15:25:00'),
  },
  {
    id: '8',
    taskId: null,
    startTime: new Date('2024-03-10T15:30:00'),
    endTime: new Date('2024-03-10T15:45:00'),
    duration: 15 * 60 * 1000,
    status: SessionStatus.COMPLETED,
    type: 'long_break',
    createdAt: new Date('2024-03-10T15:30:00'),
    updatedAt: new Date('2024-03-10T15:45:00'),
  },

  // Older sessions
  {
    id: '9',
    taskId: '3',
    startTime: new Date('2024-03-08T09:00:00'),
    endTime: new Date('2024-03-08T09:25:00'),
    duration: 25 * 60 * 1000,
    status: SessionStatus.COMPLETED,
    type: 'work',
    createdAt: new Date('2024-03-08T09:00:00'),
    updatedAt: new Date('2024-03-08T09:25:00'),
  },
  {
    id: '10',
    taskId: '3',
    startTime: new Date('2024-03-08T09:30:00'),
    endTime: new Date('2024-03-08T09:55:00'),
    duration: 25 * 60 * 1000,
    status: SessionStatus.COMPLETED,
    type: 'work',
    createdAt: new Date('2024-03-08T09:30:00'),
    updatedAt: new Date('2024-03-08T09:55:00'),
  },
];

// Browser storage utilities
export const sessionStorage = {
  // Get sessions from localStorage or return mock data
  getSessions: async (): Promise<PomodoroSession[]> => {
    if (typeof window === 'undefined') return MOCK_SESSIONS;

    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : null,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
        }));
      }
    } catch (error) {
      console.warn('Failed to load sessions from localStorage:', error);
    }

    // Return mock data and save it to localStorage for future use
    sessionStorage.saveSessions(MOCK_SESSIONS);
    return MOCK_SESSIONS;
  },

  // Save sessions to localStorage
  saveSessions: (sessions: PomodoroSession[]): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.warn('Failed to save sessions to localStorage:', error);
    }
  },

  // Add a new session
  addSession: async (session: PomodoroSession): Promise<PomodoroSession> => {
    const sessions = await sessionStorage.getSessions();
    const newSessions = [session, ...sessions];
    sessionStorage.saveSessions(newSessions);
    return session;
  },

  // Update an existing session
  updateSession: async (sessionId: string, updates: Partial<PomodoroSession>): Promise<PomodoroSession | null> => {
    const sessions = await sessionStorage.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);

    if (sessionIndex === -1) return null;

    const updatedSession = { ...sessions[sessionIndex], ...updates, updatedAt: new Date() };
    sessions[sessionIndex] = updatedSession;
    sessionStorage.saveSessions(sessions);
    return updatedSession;
  },

  // Delete a session
  deleteSession: async (sessionId: string): Promise<boolean> => {
    const sessions = await sessionStorage.getSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);

    if (filteredSessions.length === sessions.length) return false;

    sessionStorage.saveSessions(filteredSessions);
    return true;
  },
};

// Task storage utilities
export const taskStorage = {
  // Get tasks from localStorage or return mock data
  getTasks: async (): Promise<Task[]> => {
    if (typeof window === 'undefined') return MOCK_TASKS;

    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
      }
    } catch (error) {
      console.warn('Failed to load tasks from localStorage:', error);
    }

    // Return mock data and save it to localStorage for future use
    taskStorage.saveTasks(MOCK_TASKS);
    return MOCK_TASKS;
  },

  // Save tasks to localStorage
  saveTasks: (tasks: Task[]): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.warn('Failed to save tasks to localStorage:', error);
    }
  },

  // Get a specific task by ID
  getTaskById: async (taskId: string): Promise<Task | null> => {
    const tasks = await taskStorage.getTasks();
    return tasks.find(t => t.id === taskId) || null;
  },
};

// Helper function to merge sessions with their associated tasks
export const mergeSessionsWithTasks = async (sessions: PomodoroSession[]): Promise<SessionWithTask[]> => {
  const tasks = await taskStorage.getTasks();
  const taskMap = new Map(tasks.map(task => [task.id, task]));

  return sessions.map(session => ({
    ...session,
    task: session.taskId ? taskMap.get(session.taskId) || null : null,
  }));
};