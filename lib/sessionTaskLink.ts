/**
 * Task-Session Linking Module
 *
 * Provides functionality to link pomodoro sessions to tasks and manage
 * the relationships between sessions and tasks. This module enables users
 * to track which tasks they worked on during specific pomodoro sessions,
 * providing insights into productivity and time allocation.
 *
 * @example
 * ```typescript
 * import { linkSessionToTask, getSessionsByTaskId } from './sessionTaskLink';
 *
 * // Link a completed pomodoro session to a task
 * await linkSessionToTask('session-123', 'task-456', 'Worked on feature implementation');
 *
 * // Get all sessions for a specific task
 * const sessions = await getSessionsByTaskId('task-456');
 * ```
 */

// =============================================================================
// Core Entity Types
// =============================================================================

/**
 * Represents a task that can be worked on during pomodoro sessions
 */
export interface Task {
  /** Unique identifier for the task */
  id: string;
  /** Human-readable title of the task */
  title: string;
  /** Optional detailed description of the task */
  description?: string;
  /** When the task was created */
  createdAt: Date;
  /** When the task was last updated */
  updatedAt: Date;
  /** Whether the task has been completed */
  completed: boolean;
  /** Priority level of the task */
  priority?: 'low' | 'medium' | 'high';
  /** Estimated number of pomodoro sessions needed */
  estimatedPomodoros?: number;
}

/**
 * Represents a pomodoro session or break period
 */
export interface Session {
  /** Unique identifier for the session */
  id: string;
  /** When the session started */
  startTime: Date;
  /** When the session ended (undefined for ongoing sessions) */
  endTime?: Date;
  /** Duration of the session in minutes */
  duration: number;
  /** Type of session */
  type: 'pomodoro' | 'short_break' | 'long_break';
  /** Whether the session was completed successfully */
  completed: boolean;
  /** When the session record was created */
  createdAt: Date;
}

// =============================================================================
// Session-Task Linking Types
// =============================================================================

/**
 * Represents a link between a session and a task
 */
export interface SessionTaskLink {
  /** ID of the linked session */
  sessionId: string;
  /** ID of the linked task */
  taskId: string;
  /** When the link was created */
  linkedAt: Date;
  /** Optional notes about what was accomplished during the session */
  notes?: string;
}

/**
 * Combined information about a linked session and its associated task
 */
export interface LinkedSessionInfo {
  /** The session information */
  session: Session;
  /** The associated task information */
  task: Task;
  /** When the session was linked to the task */
  linkedAt: Date;
  /** Optional notes about the session */
  notes?: string;
}

/**
 * Summary information for a task including all linked sessions
 */
export interface TaskSessionSummary {
  /** ID of the task */
  taskId: string;
  /** The task information */
  task: Task;
  /** All sessions linked to this task */
  sessions: Session[];
  /** Total duration of all sessions in minutes */
  totalDuration: number;
  /** Number of completed sessions */
  completedSessions: number;
}

// =============================================================================
// Query Options
// =============================================================================

/**
 * Options for querying sessions
 */
export interface SessionQueryOptions {
  /** Field to sort results by */
  sortBy?: 'linkedAt' | 'startTime' | 'duration';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Whether to include incomplete sessions in results */
  includeIncomplete?: boolean;
}

/**
 * Options for querying tasks
 */
export interface TaskQueryOptions {
  /** Field to sort results by */
  sortBy?: 'createdAt' | 'priority' | 'title';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Whether to include completed tasks in results */
  includeCompleted?: boolean;
}

// =============================================================================
// Storage and Utility Types
// =============================================================================

/**
 * Internal storage structure for the module
 * @private
 */
export interface SessionTaskStorage {
  /** Map of session IDs to session-task links */
  links: Map<string, SessionTaskLink>;
  /** Map of session IDs to sessions */
  sessions: Map<string, Session>;
  /** Map of task IDs to tasks */
  tasks: Map<string, Task>;
}

/**
 * Custom error class for session-task linking operations
 */
export class SessionTaskLinkError extends Error {
  /**
   * Creates a new SessionTaskLinkError
   * @param message - Error message
   * @param code - Error code for programmatic handling
   */
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SessionTaskLinkError';
  }
}

/**
 * Result of input validation operations
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of validation error messages */
  errors: string[];
}

// In-memory storage for demonstration (could be replaced with persistent storage)
const storage: SessionTaskStorage = {
  links: new Map(),
  sessions: new Map(),
  tasks: new Map(),
};

// Core linking functions

/**
 * Links a session to a task
 * @param sessionId - The ID of the session to link
 * @param taskId - The ID of the task to link to
 * @param notes - Optional notes about the link
 * @returns Promise resolving to the created link
 * @throws SessionTaskLinkError if validation fails
 */
export async function linkSessionToTask(
  sessionId: string,
  taskId: string,
  notes?: string
): Promise<SessionTaskLink> {
  // Validate inputs
  const validation = validateLinkInputs(sessionId, taskId);
  if (!validation.isValid) {
    throw new SessionTaskLinkError(
      `Invalid link parameters: ${validation.errors.join(', ')}`,
      'VALIDATION_ERROR'
    );
  }

  // Check if session exists
  const session = storage.sessions.get(sessionId);
  if (!session) {
    throw new SessionTaskLinkError(
      `Session with ID ${sessionId} not found`,
      'SESSION_NOT_FOUND'
    );
  }

  // Check if task exists
  const task = storage.tasks.get(taskId);
  if (!task) {
    throw new SessionTaskLinkError(
      `Task with ID ${taskId} not found`,
      'TASK_NOT_FOUND'
    );
  }

  // Check if session is already linked
  if (storage.links.has(sessionId)) {
    throw new SessionTaskLinkError(
      `Session ${sessionId} is already linked to a task`,
      'ALREADY_LINKED'
    );
  }

  // Create the link
  const link: SessionTaskLink = {
    sessionId,
    taskId,
    linkedAt: new Date(),
    notes,
  };

  storage.links.set(sessionId, link);
  return link;
}

/**
 * Removes the link for a session
 * @param sessionId - The ID of the session to unlink
 * @returns Promise resolving to true if unlinked, false if not linked
 */
export async function unlinkSession(sessionId: string): Promise<boolean> {
  if (!sessionId) {
    throw new SessionTaskLinkError('Session ID is required', 'MISSING_SESSION_ID');
  }

  return storage.links.delete(sessionId);
}

/**
 * Checks if a session is linked to any task
 * @param sessionId - The ID of the session to check
 * @returns Promise resolving to true if linked, false otherwise
 */
export async function isSessionLinked(sessionId: string): Promise<boolean> {
  if (!sessionId) {
    return false;
  }

  return storage.links.has(sessionId);
}

// Query and retrieval functions

/**
 * Retrieves all sessions linked to a specific task
 * @param taskId - The ID of the task
 * @param options - Query options for sorting and filtering
 * @returns Promise resolving to array of sessions linked to the task
 */
export async function getSessionsByTaskId(
  taskId: string,
  options: SessionQueryOptions = {}
): Promise<Session[]> {
  if (!taskId) {
    return [];
  }

  // Find all links for this task
  const taskLinks = Array.from(storage.links.values()).filter(
    link => link.taskId === taskId
  );

  // Get the sessions
  let sessions = taskLinks
    .map(link => storage.sessions.get(link.sessionId))
    .filter((session): session is Session => session !== undefined);

  // Apply filtering
  if (!options.includeIncomplete) {
    sessions = sessions.filter(session => session.completed);
  }

  // Apply sorting
  if (options.sortBy) {
    sessions.sort((a, b) => {
      let comparison = 0;

      switch (options.sortBy) {
        case 'startTime':
          comparison = a.startTime.getTime() - b.startTime.getTime();
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'linkedAt':
          const linkA = storage.links.get(a.id);
          const linkB = storage.links.get(b.id);
          if (linkA && linkB) {
            comparison = linkA.linkedAt.getTime() - linkB.linkedAt.getTime();
          }
          break;
      }

      return options.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  return sessions;
}

/**
 * Retrieves the task linked to a specific session
 * @param sessionId - The ID of the session
 * @returns Promise resolving to the linked task or null if not linked
 */
export async function getTaskBySessionId(sessionId: string): Promise<Task | null> {
  if (!sessionId) {
    return null;
  }

  const link = storage.links.get(sessionId);
  if (!link) {
    return null;
  }

  return storage.tasks.get(link.taskId) || null;
}

/**
 * Retrieves all linked session information
 * @param options - Query options for filtering and sorting
 * @returns Promise resolving to array of linked session information
 */
export async function getAllLinkedSessions(
  options: SessionQueryOptions = {}
): Promise<LinkedSessionInfo[]> {
  const links = Array.from(storage.links.values());
  let linkedSessions: LinkedSessionInfo[] = [];

  for (const link of links) {
    const session = storage.sessions.get(link.sessionId);
    const task = storage.tasks.get(link.taskId);

    if (session && task) {
      // Apply filtering
      if (!options.includeIncomplete && !session.completed) {
        continue;
      }

      linkedSessions.push({
        session,
        task,
        linkedAt: link.linkedAt,
        notes: link.notes,
      });
    }
  }

  // Apply sorting
  if (options.sortBy) {
    linkedSessions.sort((a, b) => {
      let comparison = 0;

      switch (options.sortBy) {
        case 'startTime':
          comparison = a.session.startTime.getTime() - b.session.startTime.getTime();
          break;
        case 'duration':
          comparison = a.session.duration - b.session.duration;
          break;
        case 'linkedAt':
          comparison = a.linkedAt.getTime() - b.linkedAt.getTime();
          break;
      }

      return options.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  return linkedSessions;
}

/**
 * Retrieves summary information for a task including all linked sessions
 * @param taskId - The ID of the task
 * @returns Promise resolving to task summary with session information
 */
export async function getTaskSessionSummary(taskId: string): Promise<TaskSessionSummary | null> {
  const task = storage.tasks.get(taskId);
  if (!task) {
    return null;
  }

  const sessions = await getSessionsByTaskId(taskId, { includeIncomplete: true });
  const completedSessions = sessions.filter(session => session.completed);
  const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);

  return {
    taskId,
    task,
    sessions,
    totalDuration,
    completedSessions: completedSessions.length,
  };
}

// Session completion integration

/**
 * Completes a pomodoro session and links it to a task
 * @param sessionId - The ID of the session to complete
 * @param taskId - The ID of the task to link to
 * @param notes - Optional notes about the session
 * @returns Promise resolving to the completed session and link information
 * @throws SessionTaskLinkError if validation fails or session cannot be completed
 */
export async function completeSessionWithTask(
  sessionId: string,
  taskId: string,
  notes?: string
): Promise<{ session: Session; link: SessionTaskLink }> {
  // Validate inputs
  const validation = validateLinkInputs(sessionId, taskId);
  if (!validation.isValid) {
    throw new SessionTaskLinkError(
      `Invalid completion parameters: ${validation.errors.join(', ')}`,
      'VALIDATION_ERROR'
    );
  }

  // Get the session
  const session = storage.sessions.get(sessionId);
  if (!session) {
    throw new SessionTaskLinkError(
      `Session with ID ${sessionId} not found`,
      'SESSION_NOT_FOUND'
    );
  }

  // Check if session is already completed
  if (session.completed) {
    throw new SessionTaskLinkError(
      `Session ${sessionId} is already completed`,
      'ALREADY_COMPLETED'
    );
  }

  // Check if session can be completed (has valid duration, etc.)
  if (!isSessionCompletable(session)) {
    throw new SessionTaskLinkError(
      `Session ${sessionId} cannot be completed in its current state`,
      'NOT_COMPLETABLE'
    );
  }

  // Complete the session
  const completedSession: Session = {
    ...session,
    completed: true,
    endTime: new Date(),
  };

  // Update storage
  storage.sessions.set(sessionId, completedSession);

  // Link the session to the task
  const link = await linkSessionToTask(sessionId, taskId, notes);

  return {
    session: completedSession,
    link,
  };
}

// Storage management functions (for testing and utility purposes)

/**
 * Adds a session to the storage
 * @param session - The session to add
 */
export function addSession(session: Session): void {
  storage.sessions.set(session.id, session);
}

/**
 * Adds a task to the storage
 * @param task - The task to add
 */
export function addTask(task: Task): void {
  storage.tasks.set(task.id, task);
}

/**
 * Retrieves a session by ID
 * @param sessionId - The ID of the session
 * @returns The session or undefined if not found
 */
export function getSession(sessionId: string): Session | undefined {
  return storage.sessions.get(sessionId);
}

/**
 * Retrieves a task by ID
 * @param taskId - The ID of the task
 * @returns The task or undefined if not found
 */
export function getTask(taskId: string): Task | undefined {
  return storage.tasks.get(taskId);
}

/**
 * Clears all storage (useful for testing)
 */
export function clearStorage(): void {
  storage.links.clear();
  storage.sessions.clear();
  storage.tasks.clear();
}

/**
 * Gets storage statistics
 * @returns Object with counts of stored entities
 */
export function getStorageStats(): { links: number; sessions: number; tasks: number } {
  return {
    links: storage.links.size,
    sessions: storage.sessions.size,
    tasks: storage.tasks.size,
  };
}

// Helper functions

/**
 * Checks if a session can be completed
 * @param session - The session to check
 * @returns True if the session can be completed
 */
function isSessionCompletable(session: Session): boolean {
  // Session must have started
  if (!session.startTime) {
    return false;
  }

  // For pomodoro sessions, check if minimum duration has passed
  if (session.type === 'pomodoro') {
    const minDuration = 1; // minimum 1 minute
    return session.duration >= minDuration;
  }

  // For break sessions, they can be completed immediately
  return true;
}

// Helper validation function
function validateLinkInputs(sessionId: string, taskId: string): ValidationResult {
  const errors: string[] = [];

  if (!sessionId || sessionId.trim() === '') {
    errors.push('Session ID is required');
  }

  if (!taskId || taskId.trim() === '') {
    errors.push('Task ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}