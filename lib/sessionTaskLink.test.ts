/**
 * Test Suite for Task-Session Linking Module
 */

import {
  // Types
  Task,
  Session,
  SessionTaskLink,
  SessionTaskLinkError,
  // Core functions
  linkSessionToTask,
  unlinkSession,
  isSessionLinked,
  // Query functions
  getSessionsByTaskId,
  getTaskBySessionId,
  getAllLinkedSessions,
  getTaskSessionSummary,
  // Session completion
  completeSessionWithTask,
  // Storage functions
  addSession,
  addTask,
  getSession,
  getTask,
  clearStorage,
  getStorageStats,
} from './sessionTaskLink';

// Test utilities
function createTestTask(id: string, title: string, completed = false): Task {
  return {
    id,
    title,
    description: `Test task: ${title}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    completed,
    priority: 'medium',
    estimatedPomodoros: 4,
  };
}

function createTestSession(id: string, duration = 25, completed = false): Session {
  return {
    id,
    startTime: new Date(),
    endTime: completed ? new Date() : undefined,
    duration,
    type: 'pomodoro',
    completed,
    createdAt: new Date(),
  };
}

// Test suite
describe('SessionTaskLink Module', () => {
  beforeEach(() => {
    // Clear storage before each test
    clearStorage();
  });

  describe('Storage Management', () => {
    test('should add and retrieve sessions', () => {
      const session = createTestSession('session-1', 25, true);
      addSession(session);

      const retrieved = getSession('session-1');
      expect(retrieved).toEqual(session);
      expect(getSession('nonexistent')).toBeUndefined();
    });

    test('should add and retrieve tasks', () => {
      const task = createTestTask('task-1', 'Test Task');
      addTask(task);

      const retrieved = getTask('task-1');
      expect(retrieved).toEqual(task);
      expect(getTask('nonexistent')).toBeUndefined();
    });

    test('should clear all storage', () => {
      addSession(createTestSession('session-1'));
      addTask(createTestTask('task-1', 'Test'));

      expect(getStorageStats().sessions).toBe(1);
      expect(getStorageStats().tasks).toBe(1);

      clearStorage();

      expect(getStorageStats().sessions).toBe(0);
      expect(getStorageStats().tasks).toBe(0);
      expect(getStorageStats().links).toBe(0);
    });
  });

  describe('Core Linking Functions', () => {
    beforeEach(() => {
      // Add test data
      addSession(createTestSession('session-1', 25, true));
      addSession(createTestSession('session-2', 30, false));
      addTask(createTestTask('task-1', 'First Task'));
      addTask(createTestTask('task-2', 'Second Task'));
    });

    describe('linkSessionToTask', () => {
      test('should successfully link session to task', async () => {
        const link = await linkSessionToTask('session-1', 'task-1', 'Test notes');

        expect(link.sessionId).toBe('session-1');
        expect(link.taskId).toBe('task-1');
        expect(link.notes).toBe('Test notes');
        expect(link.linkedAt).toBeInstanceOf(Date);
      });

      test('should throw error for invalid session ID', async () => {
        await expect(linkSessionToTask('', 'task-1')).rejects.toThrow(SessionTaskLinkError);
        await expect(linkSessionToTask('nonexistent', 'task-1')).rejects.toThrow('SESSION_NOT_FOUND');
      });

      test('should throw error for invalid task ID', async () => {
        await expect(linkSessionToTask('session-1', '')).rejects.toThrow(SessionTaskLinkError);
        await expect(linkSessionToTask('session-1', 'nonexistent')).rejects.toThrow('TASK_NOT_FOUND');
      });

      test('should throw error when session already linked', async () => {
        await linkSessionToTask('session-1', 'task-1');
        await expect(linkSessionToTask('session-1', 'task-2')).rejects.toThrow('ALREADY_LINKED');
      });
    });

    describe('unlinkSession', () => {
      test('should successfully unlink session', async () => {
        await linkSessionToTask('session-1', 'task-1');

        const unlinked = await unlinkSession('session-1');
        expect(unlinked).toBe(true);

        const isLinked = await isSessionLinked('session-1');
        expect(isLinked).toBe(false);
      });

      test('should return false for non-linked session', async () => {
        const unlinked = await unlinkSession('session-1');
        expect(unlinked).toBe(false);
      });

      test('should throw error for empty session ID', async () => {
        await expect(unlinkSession('')).rejects.toThrow('MISSING_SESSION_ID');
      });
    });

    describe('isSessionLinked', () => {
      test('should return true for linked session', async () => {
        await linkSessionToTask('session-1', 'task-1');
        const isLinked = await isSessionLinked('session-1');
        expect(isLinked).toBe(true);
      });

      test('should return false for non-linked session', async () => {
        const isLinked = await isSessionLinked('session-1');
        expect(isLinked).toBe(false);
      });

      test('should return false for empty session ID', async () => {
        const isLinked = await isSessionLinked('');
        expect(isLinked).toBe(false);
      });
    });
  });

  describe('Query Functions', () => {
    beforeEach(() => {
      // Add test data with multiple sessions and tasks
      addSession(createTestSession('session-1', 25, true));
      addSession(createTestSession('session-2', 30, true));
      addSession(createTestSession('session-3', 15, false));
      addTask(createTestTask('task-1', 'First Task'));
      addTask(createTestTask('task-2', 'Second Task'));
    });

    describe('getSessionsByTaskId', () => {
      test('should return empty array for task with no sessions', async () => {
        const sessions = await getSessionsByTaskId('task-1');
        expect(sessions).toEqual([]);
      });

      test('should return linked sessions for task', async () => {
        await linkSessionToTask('session-1', 'task-1');
        await linkSessionToTask('session-2', 'task-1');

        const sessions = await getSessionsByTaskId('task-1');
        expect(sessions).toHaveLength(2);
        expect(sessions.map(s => s.id)).toContain('session-1');
        expect(sessions.map(s => s.id)).toContain('session-2');
      });

      test('should filter incomplete sessions when requested', async () => {
        await linkSessionToTask('session-1', 'task-1'); // completed
        await linkSessionToTask('session-3', 'task-1'); // incomplete

        const allSessions = await getSessionsByTaskId('task-1', { includeIncomplete: true });
        expect(allSessions).toHaveLength(2);

        const completedOnly = await getSessionsByTaskId('task-1', { includeIncomplete: false });
        expect(completedOnly).toHaveLength(1);
        expect(completedOnly[0].id).toBe('session-1');
      });

      test('should sort sessions by duration', async () => {
        await linkSessionToTask('session-1', 'task-1'); // 25 minutes
        await linkSessionToTask('session-2', 'task-1'); // 30 minutes

        const ascending = await getSessionsByTaskId('task-1', {
          sortBy: 'duration',
          sortOrder: 'asc'
        });
        expect(ascending[0].duration).toBe(25);
        expect(ascending[1].duration).toBe(30);

        const descending = await getSessionsByTaskId('task-1', {
          sortBy: 'duration',
          sortOrder: 'desc'
        });
        expect(descending[0].duration).toBe(30);
        expect(descending[1].duration).toBe(25);
      });
    });

    describe('getTaskBySessionId', () => {
      test('should return null for non-linked session', async () => {
        const task = await getTaskBySessionId('session-1');
        expect(task).toBeNull();
      });

      test('should return linked task for session', async () => {
        await linkSessionToTask('session-1', 'task-1');

        const task = await getTaskBySessionId('session-1');
        expect(task).not.toBeNull();
        expect(task!.id).toBe('task-1');
      });

      test('should return null for empty session ID', async () => {
        const task = await getTaskBySessionId('');
        expect(task).toBeNull();
      });
    });

    describe('getAllLinkedSessions', () => {
      test('should return empty array when no sessions are linked', async () => {
        const linked = await getAllLinkedSessions();
        expect(linked).toEqual([]);
      });

      test('should return all linked sessions with task information', async () => {
        await linkSessionToTask('session-1', 'task-1', 'First link');
        await linkSessionToTask('session-2', 'task-2', 'Second link');

        const linked = await getAllLinkedSessions();
        expect(linked).toHaveLength(2);

        const firstLink = linked.find(l => l.session.id === 'session-1');
        expect(firstLink).toBeDefined();
        expect(firstLink!.task.id).toBe('task-1');
        expect(firstLink!.notes).toBe('First link');
      });
    });

    describe('getTaskSessionSummary', () => {
      test('should return null for non-existent task', async () => {
        const summary = await getTaskSessionSummary('nonexistent');
        expect(summary).toBeNull();
      });

      test('should return summary with session statistics', async () => {
        await linkSessionToTask('session-1', 'task-1'); // 25 min, completed
        await linkSessionToTask('session-2', 'task-1'); // 30 min, completed
        await linkSessionToTask('session-3', 'task-1'); // 15 min, incomplete

        const summary = await getTaskSessionSummary('task-1');
        expect(summary).not.toBeNull();
        expect(summary!.taskId).toBe('task-1');
        expect(summary!.sessions).toHaveLength(3);
        expect(summary!.totalDuration).toBe(70); // 25 + 30 + 15
        expect(summary!.completedSessions).toBe(2);
      });
    });
  });

  describe('Session Completion Integration', () => {
    beforeEach(() => {
      addSession(createTestSession('session-incomplete', 25, false));
      addSession(createTestSession('session-complete', 30, true));
      addTask(createTestTask('task-1', 'Test Task'));
    });

    describe('completeSessionWithTask', () => {
      test('should complete session and link to task', async () => {
        const result = await completeSessionWithTask('session-incomplete', 'task-1', 'Completed work');

        expect(result.session.completed).toBe(true);
        expect(result.session.endTime).toBeInstanceOf(Date);
        expect(result.link.sessionId).toBe('session-incomplete');
        expect(result.link.taskId).toBe('task-1');
        expect(result.link.notes).toBe('Completed work');

        // Verify session is stored as completed
        const storedSession = getSession('session-incomplete');
        expect(storedSession!.completed).toBe(true);
      });

      test('should throw error for already completed session', async () => {
        await expect(
          completeSessionWithTask('session-complete', 'task-1')
        ).rejects.toThrow('ALREADY_COMPLETED');
      });

      test('should throw error for invalid session', async () => {
        await expect(
          completeSessionWithTask('nonexistent', 'task-1')
        ).rejects.toThrow('SESSION_NOT_FOUND');
      });

      test('should throw error for invalid task', async () => {
        await expect(
          completeSessionWithTask('session-incomplete', 'nonexistent')
        ).rejects.toThrow('TASK_NOT_FOUND');
      });
    });
  });

  describe('Error Handling', () => {
    test('should create SessionTaskLinkError with code', () => {
      const error = new SessionTaskLinkError('Test message', 'TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('SessionTaskLinkError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Edge Cases', () => {
    test('should handle concurrent linking attempts', async () => {
      addSession(createTestSession('session-1', 25, true));
      addTask(createTestTask('task-1', 'First Task'));
      addTask(createTestTask('task-2', 'Second Task'));

      // First link should succeed
      await linkSessionToTask('session-1', 'task-1');

      // Second link to same session should fail
      await expect(linkSessionToTask('session-1', 'task-2')).rejects.toThrow('ALREADY_LINKED');
    });

    test('should handle queries with non-existent IDs gracefully', async () => {
      const sessions = await getSessionsByTaskId('nonexistent');
      expect(sessions).toEqual([]);

      const task = await getTaskBySessionId('nonexistent');
      expect(task).toBeNull();

      const summary = await getTaskSessionSummary('nonexistent');
      expect(summary).toBeNull();
    });
  });
});