/**
 * Usage Examples for the Storage Service
 * Demonstrates how to use the storage service in components
 */

import {
  taskStorage,
  sessionStorage,
  settingsStorage,
  statsStorage,
  type Task,
  type Session,
  type Settings,
  type Stats,
  StorageError,
  isStorageAvailable,
  getStorageInfo,
  clearAllAppData
} from './storage';

// Example 1: Working with Tasks
export class TaskManager {
  // Create a new task
  static createTask(title: string, description?: string, priority: 'low' | 'medium' | 'high' = 'medium'): string {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newTask: Task = {
      id: taskId,
      title,
      description,
      completed: false,
      priority,
      createdAt: now,
      updatedAt: now,
      tags: []
    };

    try {
      taskStorage.addTask(newTask);

      // Update stats
      statsStorage.incrementStat('totalTasks');

      console.log('Task created successfully:', taskId);
      return taskId;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  // Mark task as completed
  static completeTask(taskId: string): void {
    try {
      taskStorage.updateTask(taskId, {
        completed: true,
        updatedAt: new Date().toISOString()
      });

      // Update stats
      statsStorage.incrementStat('completedTasks');

      console.log('Task marked as completed:', taskId);
    } catch (error) {
      console.error('Failed to complete task:', error);
      throw error;
    }
  }

  // Get all pending tasks
  static getPendingTasks(): Task[] {
    try {
      const allTasks = taskStorage.getTasks();
      return allTasks.filter(task => !task.completed);
    } catch (error) {
      console.error('Failed to get pending tasks:', error);
      return [];
    }
  }

  // Get tasks by priority
  static getTasksByPriority(priority: 'low' | 'medium' | 'high'): Task[] {
    try {
      const allTasks = taskStorage.getTasks();
      return allTasks.filter(task => task.priority === priority);
    } catch (error) {
      console.error('Failed to get tasks by priority:', error);
      return [];
    }
  }
}

// Example 2: Working with Sessions
export class SessionManager {
  private static activeSessionId: string | null = null;

  // Start a new focus session
  static startFocusSession(taskId?: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newSession: Session = {
      id: sessionId,
      startTime: new Date().toISOString(),
      type: 'focus',
      taskId,
      notes: ''
    };

    try {
      sessionStorage.addSession(newSession);
      this.activeSessionId = sessionId;

      console.log('Focus session started:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Failed to start focus session:', error);
      throw error;
    }
  }

  // End the current session
  static endSession(notes?: string): void {
    if (!this.activeSessionId) {
      throw new Error('No active session to end');
    }

    const endTime = new Date().toISOString();
    const sessions = sessionStorage.getSessions();
    const session = sessions.find(s => s.id === this.activeSessionId);

    if (session) {
      const startTime = new Date(session.startTime);
      const duration = new Date(endTime).getTime() - startTime.getTime();

      try {
        sessionStorage.updateSession(this.activeSessionId, {
          endTime,
          duration,
          notes
        });

        // Update stats
        statsStorage.incrementStat('totalSessions');
        if (session.type === 'focus') {
          statsStorage.addFocusTime(duration);
        }

        console.log('Session ended:', this.activeSessionId);
        this.activeSessionId = null;
      } catch (error) {
        console.error('Failed to end session:', error);
        throw error;
      }
    }
  }

  // Get today's sessions
  static getTodaySessions(): Session[] {
    try {
      const allSessions = sessionStorage.getSessions();
      const today = new Date().toDateString();

      return allSessions.filter(session => {
        const sessionDate = new Date(session.startTime).toDateString();
        return sessionDate === today;
      });
    } catch (error) {
      console.error('Failed to get today\'s sessions:', error);
      return [];
    }
  }
}

// Example 3: Working with Settings
export class SettingsManager {
  // Update theme
  static updateTheme(theme: 'light' | 'dark' | 'system'): void {
    try {
      settingsStorage.updateSettings({ theme });
      console.log('Theme updated to:', theme);
    } catch (error) {
      console.error('Failed to update theme:', error);
      throw error;
    }
  }

  // Update focus time
  static updateFocusTime(minutes: number): void {
    if (minutes <= 0 || minutes > 180) {
      throw new Error('Focus time must be between 1 and 180 minutes');
    }

    try {
      settingsStorage.updateSettings({ focusTime: minutes });
      console.log('Focus time updated to:', minutes, 'minutes');
    } catch (error) {
      console.error('Failed to update focus time:', error);
      throw error;
    }
  }

  // Get current settings
  static getCurrentSettings(): Settings {
    try {
      return settingsStorage.getSettings();
    } catch (error) {
      console.error('Failed to get settings:', error);
      // Return default settings on error
      return settingsStorage.getSettings();
    }
  }
}

// Example 4: Working with Stats and Analytics
export class AnalyticsManager {
  // Get productivity stats
  static getProductivityStats(): {
    completionRate: number;
    averageFocusTime: number;
    totalHours: number;
    streak: number;
  } {
    try {
      const stats = statsStorage.getStats();

      const completionRate = stats.totalTasks > 0
        ? (stats.completedTasks / stats.totalTasks) * 100
        : 0;

      const averageFocusTime = stats.totalSessions > 0
        ? stats.totalFocusTime / stats.totalSessions
        : 0;

      const totalHours = stats.totalFocusTime / (1000 * 60 * 60);

      return {
        completionRate: Math.round(completionRate * 100) / 100,
        averageFocusTime: Math.round(averageFocusTime / 1000 / 60), // in minutes
        totalHours: Math.round(totalHours * 100) / 100,
        streak: stats.streakDays
      };
    } catch (error) {
      console.error('Failed to get productivity stats:', error);
      return {
        completionRate: 0,
        averageFocusTime: 0,
        totalHours: 0,
        streak: 0
      };
    }
  }

  // Reset all stats
  static resetAllStats(): void {
    try {
      statsStorage.resetStats();
      console.log('All stats have been reset');
    } catch (error) {
      console.error('Failed to reset stats:', error);
      throw error;
    }
  }
}

// Example 5: Application Initialization
export class AppDataManager {
  // Initialize app and check storage availability
  static initialize(): { success: boolean; storageAvailable: boolean; error?: string } {
    try {
      const storageAvailable = isStorageAvailable();

      if (!storageAvailable) {
        return {
          success: false,
          storageAvailable: false,
          error: 'localStorage is not available in this environment'
        };
      }

      // Check storage info
      const storageInfo = getStorageInfo();
      console.log('Storage info:', storageInfo);

      // Validate existing data
      const tasks = taskStorage.getTasks();
      const sessions = sessionStorage.getSessions();
      const settings = settingsStorage.getSettings();
      const stats = statsStorage.getStats();

      console.log('App initialized successfully:', {
        tasks: tasks.length,
        sessions: sessions.length,
        settings: Object.keys(settings).length,
        stats: Object.keys(stats).length
      });

      return { success: true, storageAvailable: true };
    } catch (error) {
      console.error('Failed to initialize app:', error);
      return {
        success: false,
        storageAvailable: isStorageAvailable(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Export all data for backup
  static exportData(): string {
    try {
      const data = {
        tasks: taskStorage.getTasks(),
        sessions: sessionStorage.getSessions(),
        settings: settingsStorage.getSettings(),
        stats: statsStorage.getStats(),
        exportedAt: new Date().toISOString()
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  // Import data from backup
  static importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      if (data.tasks) {
        taskStorage.setTasks(data.tasks);
      }
      if (data.sessions) {
        sessionStorage.setSessions(data.sessions);
      }
      if (data.settings) {
        settingsStorage.setSettings(data.settings);
      }
      if (data.stats) {
        statsStorage.setStats(data.stats);
      }

      console.log('Data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  // Clear all app data
  static clearAllData(): void {
    try {
      clearAllAppData();
      console.log('All app data cleared');
    } catch (error) {
      console.error('Failed to clear app data:', error);
      throw error;
    }
  }
}

// Example 6: Error Handling Best Practices
export class StorageErrorHandler {
  static handleStorageError(error: unknown, operation: string): void {
    if (error instanceof StorageError) {
      console.error(`Storage error during ${operation}:`, error.message);

      // Handle specific error types
      if (error.message.includes('quota exceeded')) {
        // Show user a message about storage being full
        console.warn('Storage quota exceeded - consider clearing old data');
      } else if (error.message.includes('not found')) {
        // Handle missing data gracefully
        console.warn('Requested data not found - this may be expected');
      } else {
        // General storage error
        console.error('Unexpected storage error:', error);
      }
    } else {
      console.error(`Unexpected error during ${operation}:`, error);
    }
  }
}

// Usage demonstrations
if (typeof window !== 'undefined') {
  // Browser environment - actual usage
  console.log('Storage service is ready for browser use!');
} else {
  // Node.js environment - demonstrations
  console.log('Usage examples created - ready for browser integration');
}

export default {
  TaskManager,
  SessionManager,
  SettingsManager,
  AnalyticsManager,
  AppDataManager,
  StorageErrorHandler
};