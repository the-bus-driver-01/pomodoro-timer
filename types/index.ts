/**
 * TypeScript Types and Interfaces for Pomodoro Timer App
 * Comprehensive type definitions for time tracking, task management, and productivity analytics
 */

// ============================================================================
// BASE UTILITY TYPES AND ENUMS
// ============================================================================

/**
 * Priority levels for tasks
 */
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Session types for different work/break cycles
 */
export type SessionType = 'work' | 'shortBreak' | 'longBreak';

/**
 * Timer states for tracking current status
 */
export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

/**
 * Common time periods for statistics and filtering
 */
export type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all';

/**
 * Task completion status
 */
export type TaskStatus = 'pending' | 'inProgress' | 'completed' | 'archived';

// ============================================================================
// TIMER INTERFACE
// ============================================================================

/**
 * Timer interface for time tracking functionality
 * Handles both active timing and completed sessions
 */
export interface Timer {
  /** Unique identifier for the timer */
  id: string;

  /** Optional name/label for the timer */
  name?: string;

  /** Optional description */
  description?: string;

  /** When the timer was started */
  startTime: Date;

  /** When the timer ended (null if still running) */
  endTime: Date | null;

  /** Total duration in milliseconds */
  duration: number;

  /** Current state of the timer */
  state: TimerState;

  /** Whether the timer is currently active */
  isActive: boolean;

  /** Whether the timer is currently paused */
  isPaused: boolean;

  /** Type of session this timer represents */
  sessionType: SessionType;

  /** Optional task ID this timer is associated with */
  taskId?: string;

  /** When this timer record was created */
  createdAt: Date;

  /** Last time this timer was updated */
  updatedAt: Date;
}

// ============================================================================
// TASK INTERFACE
// ============================================================================

/**
 * Task interface for task management
 * Comprehensive task tracking with priority, duration, and categorization
 */
export interface Task {
  /** Unique identifier for the task */
  id: string;

  /** Task title */
  title: string;

  /** Optional detailed description */
  description?: string;

  /** Current status of the task */
  status: TaskStatus;

  /** Task priority level */
  priority: Priority;

  /** Whether the task is completed */
  completed: boolean;

  /** Estimated duration in minutes */
  estimatedDuration?: number;

  /** Actual time spent in minutes (calculated from sessions) */
  actualDuration: number;

  /** Number of pomodoro sessions completed for this task */
  pomodoroCount: number;

  /** Tags for categorization */
  tags: string[];

  /** Optional project/category this task belongs to */
  project?: string;

  /** Due date for the task */
  dueDate?: Date;

  /** When the task was created */
  createdAt: Date;

  /** Last time the task was updated */
  updatedAt: Date;

  /** When the task was completed (if completed) */
  completedAt?: Date;

  /** List of session IDs associated with this task */
  sessionIds: string[];

  /** Optional notes or additional context */
  notes?: string;
}

// ============================================================================
// SESSION INTERFACE
// ============================================================================

/**
 * Session interface for work/break session tracking
 * Links timing data with tasks and provides session analytics
 */
export interface Session {
  /** Unique identifier for the session */
  id: string;

  /** Type of session (work, short break, long break) */
  type: SessionType;

  /** Associated task ID (optional for break sessions) */
  taskId?: string;

  /** When the session started */
  startTime: Date;

  /** When the session ended */
  endTime: Date;

  /** Planned duration in milliseconds */
  plannedDuration: number;

  /** Actual duration in milliseconds */
  actualDuration: number;

  /** Whether the session was completed successfully */
  completed: boolean;

  /** Whether the session was interrupted/cancelled */
  interrupted: boolean;

  /** Reason for interruption (if applicable) */
  interruptionReason?: string;

  /** Optional notes about the session */
  notes?: string;

  /** Productivity rating (1-5 scale, optional) */
  productivityRating?: number;

  /** Energy level at start (1-5 scale, optional) */
  energyLevelStart?: number;

  /** Energy level at end (1-5 scale, optional) */
  energyLevelEnd?: number;

  /** When this session record was created */
  createdAt: Date;
}

// ============================================================================
// STATS INTERFACE
// ============================================================================

/**
 * Comprehensive statistics interface for analytics and productivity metrics
 * Provides detailed insights into work patterns and productivity
 */
export interface Stats {
  /** Time period these stats represent */
  period: TimePeriod;

  /** Start date of the stats period */
  startDate: Date;

  /** End date of the stats period */
  endDate: Date;

  // Session Counts
  /** Total number of work sessions */
  workSessions: number;

  /** Total number of short break sessions */
  shortBreakSessions: number;

  /** Total number of long break sessions */
  longBreakSessions: number;

  /** Total number of completed sessions */
  completedSessions: number;

  /** Total number of interrupted sessions */
  interruptedSessions: number;

  // Time Totals
  /** Total work time in minutes */
  totalWorkTime: number;

  /** Total break time in minutes */
  totalBreakTime: number;

  /** Total focus time (work sessions only) in minutes */
  totalFocusTime: number;

  /** Total planned time in minutes */
  totalPlannedTime: number;

  // Averages
  /** Average work session duration in minutes */
  averageWorkSession: number;

  /** Average break duration in minutes */
  averageBreakDuration: number;

  /** Average daily work time in minutes */
  averageDailyWorkTime: number;

  /** Average productivity rating */
  averageProductivityRating?: number;

  // Task Metrics
  /** Total number of tasks worked on */
  tasksWorkedOn: number;

  /** Total number of tasks completed */
  tasksCompleted: number;

  /** Task completion rate (percentage) */
  taskCompletionRate: number;

  // Productivity Metrics
  /** Session completion rate (percentage) */
  sessionCompletionRate: number;

  /** Focus efficiency (actual vs planned time ratio) */
  focusEfficiency: number;

  // Streaks
  /** Current consecutive days with sessions */
  currentStreak: number;

  /** Longest consecutive days streak */
  longestStreak: number;

  // Daily Breakdown
  /** Work time by day of week */
  dailyBreakdown: {
    [key: string]: {
      date: string;
      workTime: number;
      sessions: number;
      tasksCompleted: number;
    };
  };

  // Hourly patterns
  /** Most productive hours of the day */
  productiveHours: number[];

  /** When these stats were last calculated */
  calculatedAt: Date;
}

// ============================================================================
// APP STATE INTERFACE
// ============================================================================

/**
 * Application state interface for state management
 * Combines all entities with UI state and user preferences
 */
export interface AppState {
  // Entity Collections
  /** All timers in the application */
  timers: Record<string, Timer>;

  /** All tasks in the application */
  tasks: Record<string, Task>;

  /** All sessions in the application */
  sessions: Record<string, Session>;

  // Current Active States
  /** Currently active timer (if any) */
  activeTimerId: string | null;

  /** Currently selected task (if any) */
  selectedTaskId: string | null;

  /** Current session (if any) */
  currentSessionId: string | null;

  // UI State
  /** Whether the timer is visible/focused */
  timerVisible: boolean;

  /** Current view/page the user is on */
  currentView: 'timer' | 'tasks' | 'stats' | 'settings';

  /** Loading states for various operations */
  loading: {
    tasks: boolean;
    sessions: boolean;
    stats: boolean;
  };

  /** Error states */
  errors: {
    general?: string;
    timer?: string;
    tasks?: string;
  };

  // User Preferences
  /** User settings and preferences */
  settings: {
    /** Work session duration in minutes */
    workDuration: number;

    /** Short break duration in minutes */
    shortBreakDuration: number;

    /** Long break duration in minutes */
    longBreakDuration: number;

    /** Number of work sessions before long break */
    sessionsUntilLongBreak: number;

    /** Whether to auto-start breaks */
    autoStartBreaks: boolean;

    /** Whether to auto-start work sessions after breaks */
    autoStartWork: boolean;

    /** Whether to play sound notifications */
    soundEnabled: boolean;

    /** Whether to show desktop notifications */
    notificationsEnabled: boolean;

    /** Theme preference */
    theme: 'light' | 'dark' | 'system';

    /** Default task priority */
    defaultTaskPriority: Priority;
  };

  // Cached Statistics
  /** Pre-calculated stats for different time periods */
  cachedStats: {
    today?: Stats;
    week?: Stats;
    month?: Stats;
    year?: Stats;
  };

  /** When the app state was last saved */
  lastSaved: Date;
}

// ============================================================================
// UTILITY TYPES AND HELPERS
// ============================================================================

/**
 * Type for creating a new task (omits auto-generated fields)
 */
export type CreateTaskInput = Omit<
  Task,
  'id' | 'createdAt' | 'updatedAt' | 'actualDuration' | 'pomodoroCount' | 'sessionIds' | 'completedAt'
> & {
  id?: string;
};

/**
 * Type for updating an existing task (all fields optional except id)
 */
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt'>> & {
  id: string;
  updatedAt?: Date;
};

/**
 * Type for creating a new session (omits auto-generated fields)
 */
export type CreateSessionInput = Omit<Session, 'id' | 'createdAt' | 'actualDuration' | 'endTime'> & {
  id?: string;
};

/**
 * Type for filtering sessions
 */
export interface SessionFilters {
  /** Filter by session type */
  type?: SessionType;

  /** Filter by associated task */
  taskId?: string;

  /** Filter by completion status */
  completed?: boolean;

  /** Filter by date range */
  dateRange?: {
    start: Date;
    end: Date;
  };

  /** Filter by minimum duration (in minutes) */
  minDuration?: number;

  /** Filter by maximum duration (in minutes) */
  maxDuration?: number;
}

/**
 * Type for filtering tasks
 */
export interface TaskFilters {
  /** Filter by completion status */
  status?: TaskStatus;

  /** Filter by priority */
  priority?: Priority;

  /** Filter by project */
  project?: string;

  /** Filter by tags (task must have all specified tags) */
  tags?: string[];

  /** Filter by due date range */
  dueDateRange?: {
    start: Date;
    end: Date;
  };

  /** Search text (matches title, description, notes) */
  searchText?: string;
}

/**
 * Configuration for timer settings
 */
export interface TimerConfig {
  /** Work session duration in minutes */
  workDuration: number;

  /** Short break duration in minutes */
  shortBreakDuration: number;

  /** Long break duration in minutes */
  longBreakDuration: number;

  /** Number of work sessions before long break */
  sessionsUntilLongBreak: number;

  /** Whether to auto-start next session */
  autoStart: boolean;

  /** Sound settings */
  sound: {
    enabled: boolean;
    volume: number;
    workEndSound?: string;
    breakEndSound?: string;
  };

  /** Notification settings */
  notifications: {
    enabled: boolean;
    showProgress: boolean;
    reminderInterval?: number; // in minutes
  };
}

/**
 * API response wrapper type
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// ============================================================================
// TYPE GUARDS AND VALIDATION HELPERS
// ============================================================================

/**
 * Type guard to check if a value is a valid Priority
 */
export function isPriority(value: any): value is Priority {
  return ['low', 'medium', 'high', 'urgent'].includes(value);
}

/**
 * Type guard to check if a value is a valid SessionType
 */
export function isSessionType(value: any): value is SessionType {
  return ['work', 'shortBreak', 'longBreak'].includes(value);
}

/**
 * Type guard to check if a value is a valid TimerState
 */
export function isTimerState(value: any): value is TimerState {
  return ['idle', 'running', 'paused', 'completed'].includes(value);
}

/**
 * Type guard to check if a value is a valid TaskStatus
 */
export function isTaskStatus(value: any): value is TaskStatus {
  return ['pending', 'inProgress', 'completed', 'archived'].includes(value);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Types
  Priority,
  SessionType,
  TimerState,
  TimePeriod,
  TaskStatus,

  // Interfaces
  Timer,
  Task,
  Session,
  Stats,
  AppState,

  // Utility Types
  CreateTaskInput,
  UpdateTaskInput,
  CreateSessionInput,
  SessionFilters,
  TaskFilters,
  TimerConfig,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,

  // Type Guards
  isPriority,
  isSessionType,
  isTimerState,
  isTaskStatus,
};