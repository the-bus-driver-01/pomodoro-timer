/**
 * Local Storage Service
 * Provides CRUD operations for application data with TypeScript support
 */

// Step 1: Define TypeScript interfaces for data structures

export interface Task {
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

export interface Session {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in milliseconds
  taskId?: string;
  type: 'focus' | 'break' | 'meeting';
  notes?: string;
  metadata?: Record<string, any>;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoSave: boolean;
  focusTime: number; // in minutes
  breakTime: number; // in minutes
  language: string;
  timezone: string;
  preferences?: Record<string, any>;
}

export interface Stats {
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

// Step 3: Create storage keys constants

export const STORAGE_KEYS = {
  TASKS: 'app_tasks',
  SESSIONS: 'app_sessions',
  SETTINGS: 'app_settings',
  STATS: 'app_stats'
} as const;

// Step 2: Implement generic storage utility functions

class StorageError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Low-level localStorage utility functions
 */
const storageUtils = {
  /**
   * Get item from localStorage with JSON parsing
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      throw new StorageError(`Failed to get item '${key}' from localStorage`, error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Set item in localStorage with JSON serialization
   */
  setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new StorageError(`Storage quota exceeded when setting '${key}'`, error);
      }
      throw new StorageError(`Failed to set item '${key}' in localStorage`, error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new StorageError(`Failed to remove item '${key}' from localStorage`, error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      throw new StorageError('Failed to clear localStorage', error instanceof Error ? error : new Error(String(error)));
    }
  }
};

// Data validation helpers

const validateTask = (task: any): task is Task => {
  return (
    typeof task === 'object' &&
    task !== null &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    ['low', 'medium', 'high'].includes(task.priority) &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  );
};

const validateSession = (session: any): session is Session => {
  return (
    typeof session === 'object' &&
    session !== null &&
    typeof session.id === 'string' &&
    typeof session.startTime === 'string' &&
    ['focus', 'break', 'meeting'].includes(session.type)
  );
};

const validateSettings = (settings: any): settings is Settings => {
  return (
    typeof settings === 'object' &&
    settings !== null &&
    ['light', 'dark', 'system'].includes(settings.theme) &&
    typeof settings.notifications === 'boolean' &&
    typeof settings.autoSave === 'boolean' &&
    typeof settings.focusTime === 'number' &&
    typeof settings.breakTime === 'number' &&
    typeof settings.language === 'string' &&
    typeof settings.timezone === 'string'
  );
};

const validateStats = (stats: any): stats is Stats => {
  return (
    typeof stats === 'object' &&
    stats !== null &&
    typeof stats.totalTasks === 'number' &&
    typeof stats.completedTasks === 'number' &&
    typeof stats.totalSessions === 'number' &&
    typeof stats.totalFocusTime === 'number' &&
    typeof stats.streakDays === 'number' &&
    typeof stats.lastActive === 'string'
  );
};

// Step 4: Implement CRUD operations for Tasks

export const taskStorage = {
  /**
   * Get all tasks from localStorage
   */
  getTasks(): Task[] {
    try {
      const tasks = storageUtils.getItem<Task[]>(STORAGE_KEYS.TASKS);
      if (!tasks) return [];

      // Validate each task
      const validTasks = tasks.filter(task => {
        const isValid = validateTask(task);
        if (!isValid) {
          console.warn('Invalid task data found and filtered out:', task);
        }
        return isValid;
      });

      return validTasks;
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },

  /**
   * Set all tasks in localStorage
   */
  setTasks(tasks: Task[]): void {
    try {
      // Validate all tasks before saving
      const validTasks = tasks.filter(validateTask);
      if (validTasks.length !== tasks.length) {
        console.warn(`${tasks.length - validTasks.length} invalid tasks were filtered out`);
      }

      storageUtils.setItem(STORAGE_KEYS.TASKS, validTasks);
    } catch (error) {
      throw new StorageError('Failed to save tasks', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Add a new task
   */
  addTask(task: Task): void {
    try {
      if (!validateTask(task)) {
        throw new StorageError('Invalid task data');
      }

      const tasks = this.getTasks();
      tasks.push(task);
      this.setTasks(tasks);
    } catch (error) {
      throw new StorageError('Failed to add task', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Update an existing task
   */
  updateTask(taskId: string, updates: Partial<Task>): void {
    try {
      const tasks = this.getTasks();
      const taskIndex = tasks.findIndex(task => task.id === taskId);

      if (taskIndex === -1) {
        throw new StorageError(`Task with id '${taskId}' not found`);
      }

      const updatedTask = { ...tasks[taskIndex], ...updates, updatedAt: new Date().toISOString() };

      if (!validateTask(updatedTask)) {
        throw new StorageError('Updated task data is invalid');
      }

      tasks[taskIndex] = updatedTask;
      this.setTasks(tasks);
    } catch (error) {
      throw new StorageError('Failed to update task', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Delete a task
   */
  deleteTask(taskId: string): void {
    try {
      const tasks = this.getTasks();
      const filteredTasks = tasks.filter(task => task.id !== taskId);

      if (filteredTasks.length === tasks.length) {
        throw new StorageError(`Task with id '${taskId}' not found`);
      }

      this.setTasks(filteredTasks);
    } catch (error) {
      throw new StorageError('Failed to delete task', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Clear all tasks
   */
  clearTasks(): void {
    try {
      storageUtils.setItem(STORAGE_KEYS.TASKS, []);
    } catch (error) {
      throw new StorageError('Failed to clear tasks', error instanceof Error ? error : new Error(String(error)));
    }
  }
};

// Step 5: Implement CRUD operations for Sessions

export const sessionStorage = {
  /**
   * Get all sessions from localStorage
   */
  getSessions(): Session[] {
    try {
      const sessions = storageUtils.getItem<Session[]>(STORAGE_KEYS.SESSIONS);
      if (!sessions) return [];

      // Validate each session
      const validSessions = sessions.filter(session => {
        const isValid = validateSession(session);
        if (!isValid) {
          console.warn('Invalid session data found and filtered out:', session);
        }
        return isValid;
      });

      return validSessions;
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  },

  /**
   * Set all sessions in localStorage
   */
  setSessions(sessions: Session[]): void {
    try {
      // Validate all sessions before saving
      const validSessions = sessions.filter(validateSession);
      if (validSessions.length !== sessions.length) {
        console.warn(`${sessions.length - validSessions.length} invalid sessions were filtered out`);
      }

      storageUtils.setItem(STORAGE_KEYS.SESSIONS, validSessions);
    } catch (error) {
      throw new StorageError('Failed to save sessions', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Add a new session
   */
  addSession(session: Session): void {
    try {
      if (!validateSession(session)) {
        throw new StorageError('Invalid session data');
      }

      const sessions = this.getSessions();
      sessions.push(session);
      this.setSessions(sessions);
    } catch (error) {
      throw new StorageError('Failed to add session', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Update an existing session
   */
  updateSession(sessionId: string, updates: Partial<Session>): void {
    try {
      const sessions = this.getSessions();
      const sessionIndex = sessions.findIndex(session => session.id === sessionId);

      if (sessionIndex === -1) {
        throw new StorageError(`Session with id '${sessionId}' not found`);
      }

      const updatedSession = { ...sessions[sessionIndex], ...updates };

      if (!validateSession(updatedSession)) {
        throw new StorageError('Updated session data is invalid');
      }

      sessions[sessionIndex] = updatedSession;
      this.setSessions(sessions);
    } catch (error) {
      throw new StorageError('Failed to update session', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): void {
    try {
      const sessions = this.getSessions();
      const filteredSessions = sessions.filter(session => session.id !== sessionId);

      if (filteredSessions.length === sessions.length) {
        throw new StorageError(`Session with id '${sessionId}' not found`);
      }

      this.setSessions(filteredSessions);
    } catch (error) {
      throw new StorageError('Failed to delete session', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Clear all sessions
   */
  clearSessions(): void {
    try {
      storageUtils.setItem(STORAGE_KEYS.SESSIONS, []);
    } catch (error) {
      throw new StorageError('Failed to clear sessions', error instanceof Error ? error : new Error(String(error)));
    }
  }
};

// Step 6: Implement CRUD operations for Settings

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  notifications: true,
  autoSave: true,
  focusTime: 25,
  breakTime: 5,
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

export const settingsStorage = {
  /**
   * Get settings from localStorage with default fallback
   */
  getSettings(): Settings {
    try {
      const settings = storageUtils.getItem<Settings>(STORAGE_KEYS.SETTINGS);
      if (!settings) return DEFAULT_SETTINGS;

      // Validate settings and merge with defaults for missing properties
      if (validateSettings(settings)) {
        return { ...DEFAULT_SETTINGS, ...settings };
      } else {
        console.warn('Invalid settings data found, using defaults:', settings);
        return DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.error('Error getting settings, using defaults:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Set settings in localStorage
   */
  setSettings(settings: Settings): void {
    try {
      if (!validateSettings(settings)) {
        throw new StorageError('Invalid settings data');
      }

      storageUtils.setItem(STORAGE_KEYS.SETTINGS, settings);
    } catch (error) {
      throw new StorageError('Failed to save settings', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Update specific settings
   */
  updateSettings(updates: Partial<Settings>): void {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...updates };

      if (!validateSettings(updatedSettings)) {
        throw new StorageError('Updated settings data is invalid');
      }

      this.setSettings(updatedSettings);
    } catch (error) {
      throw new StorageError('Failed to update settings', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Reset settings to defaults
   */
  resetSettings(): void {
    try {
      this.setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      throw new StorageError('Failed to reset settings', error instanceof Error ? error : new Error(String(error)));
    }
  }
};

// Step 7: Implement CRUD operations for Stats

const DEFAULT_STATS: Stats = {
  totalTasks: 0,
  completedTasks: 0,
  totalSessions: 0,
  totalFocusTime: 0,
  streakDays: 0,
  lastActive: new Date().toISOString()
};

export const statsStorage = {
  /**
   * Get stats from localStorage with default fallback
   */
  getStats(): Stats {
    try {
      const stats = storageUtils.getItem<Stats>(STORAGE_KEYS.STATS);
      if (!stats) return DEFAULT_STATS;

      // Validate stats and merge with defaults for missing properties
      if (validateStats(stats)) {
        return { ...DEFAULT_STATS, ...stats };
      } else {
        console.warn('Invalid stats data found, using defaults:', stats);
        return DEFAULT_STATS;
      }
    } catch (error) {
      console.error('Error getting stats, using defaults:', error);
      return DEFAULT_STATS;
    }
  },

  /**
   * Set stats in localStorage
   */
  setStats(stats: Stats): void {
    try {
      if (!validateStats(stats)) {
        throw new StorageError('Invalid stats data');
      }

      storageUtils.setItem(STORAGE_KEYS.STATS, stats);
    } catch (error) {
      throw new StorageError('Failed to save stats', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Update specific stats
   */
  updateStats(updates: Partial<Stats>): void {
    try {
      const currentStats = this.getStats();
      const updatedStats = { ...currentStats, ...updates, lastActive: new Date().toISOString() };

      if (!validateStats(updatedStats)) {
        throw new StorageError('Updated stats data is invalid');
      }

      this.setStats(updatedStats);
    } catch (error) {
      throw new StorageError('Failed to update stats', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Increment a specific stat
   */
  incrementStat(statKey: keyof Pick<Stats, 'totalTasks' | 'completedTasks' | 'totalSessions' | 'streakDays'>, amount: number = 1): void {
    try {
      if (typeof amount !== 'number' || amount < 0) {
        throw new StorageError('Increment amount must be a non-negative number');
      }

      const currentStats = this.getStats();
      const updates = { [statKey]: currentStats[statKey] + amount };
      this.updateStats(updates);
    } catch (error) {
      throw new StorageError(`Failed to increment stat '${String(statKey)}'`, error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Add focus time to totalFocusTime
   */
  addFocusTime(milliseconds: number): void {
    try {
      if (typeof milliseconds !== 'number' || milliseconds < 0) {
        throw new StorageError('Focus time must be a non-negative number');
      }

      const currentStats = this.getStats();
      this.updateStats({ totalFocusTime: currentStats.totalFocusTime + milliseconds });
    } catch (error) {
      throw new StorageError('Failed to add focus time', error instanceof Error ? error : new Error(String(error)));
    }
  },

  /**
   * Reset stats to defaults
   */
  resetStats(): void {
    try {
      this.setStats(DEFAULT_STATS);
    } catch (error) {
      throw new StorageError('Failed to reset stats', error instanceof Error ? error : new Error(String(error)));
    }
  }
};

// Additional utility functions

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get storage usage information
 */
export const getStorageInfo = (): { used: number; available: boolean } => {
  if (!isStorageAvailable()) {
    return { used: 0, available: false };
  }

  try {
    const keys = Object.values(STORAGE_KEYS);
    let used = 0;

    for (const key of keys) {
      const item = localStorage.getItem(key);
      if (item) {
        used += item.length;
      }
    }

    return { used, available: true };
  } catch {
    return { used: 0, available: false };
  }
};

/**
 * Clear all app data from localStorage
 */
export const clearAllAppData = (): void => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    for (const key of keys) {
      storageUtils.removeItem(key);
    }
  } catch (error) {
    throw new StorageError('Failed to clear all app data', error instanceof Error ? error : new Error(String(error)));
  }
};

// Export error class for external use
export { StorageError };