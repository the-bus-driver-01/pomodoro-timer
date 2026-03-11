/**
 * Demonstration of Task-Session Linking functionality
 *
 * This file shows how to use the session-task linking module
 * in a typical pomodoro application scenario.
 */

import {
  // Types
  Task,
  Session,
  SessionTaskLink,
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
  clearStorage,
} from './lib/sessionTaskLink';

async function runDemo(): Promise<void> {
  console.log('🍅 Task-Session Linking Demo');
  console.log('===========================\n');

  try {
    // Clear any existing data
    clearStorage();

    // 1. Create sample tasks
    console.log('📝 Creating sample tasks...');
    const task1: Task = {
      id: 'task-001',
      title: 'Implement user authentication',
      description: 'Add login/logout functionality with JWT tokens',
      createdAt: new Date('2026-03-10T09:00:00Z'),
      updatedAt: new Date('2026-03-10T09:00:00Z'),
      completed: false,
      priority: 'high',
      estimatedPomodoros: 6,
    };

    const task2: Task = {
      id: 'task-002',
      title: 'Write API documentation',
      description: 'Document all REST endpoints with examples',
      createdAt: new Date('2026-03-10T10:00:00Z'),
      updatedAt: new Date('2026-03-10T10:00:00Z'),
      completed: false,
      priority: 'medium',
      estimatedPomodoros: 4,
    };

    addTask(task1);
    addTask(task2);
    console.log(`✅ Created ${task1.title}`);
    console.log(`✅ Created ${task2.title}\n`);

    // 2. Create sample sessions
    console.log('⏱️  Creating sample pomodoro sessions...');
    const session1: Session = {
      id: 'session-001',
      startTime: new Date('2026-03-11T09:00:00Z'),
      endTime: new Date('2026-03-11T09:25:00Z'),
      duration: 25,
      type: 'pomodoro',
      completed: true,
      createdAt: new Date('2026-03-11T09:00:00Z'),
    };

    const session2: Session = {
      id: 'session-002',
      startTime: new Date('2026-03-11T10:00:00Z'),
      endTime: new Date('2026-03-11T10:25:00Z'),
      duration: 25,
      type: 'pomodoro',
      completed: true,
      createdAt: new Date('2026-03-11T10:00:00Z'),
    };

    const session3: Session = {
      id: 'session-003',
      startTime: new Date('2026-03-11T11:00:00Z'),
      duration: 25,
      type: 'pomodoro',
      completed: false, // This one is still in progress
      createdAt: new Date('2026-03-11T11:00:00Z'),
    };

    addSession(session1);
    addSession(session2);
    addSession(session3);
    console.log('✅ Created 3 pomodoro sessions\n');

    // 3. Link sessions to tasks
    console.log('🔗 Linking sessions to tasks...');

    const link1 = await linkSessionToTask(
      session1.id,
      task1.id,
      'Set up authentication middleware and route protection'
    );
    console.log(`✅ Linked ${session1.id} to ${task1.title}`);

    const link2 = await linkSessionToTask(
      session2.id,
      task1.id,
      'Implemented JWT token generation and validation'
    );
    console.log(`✅ Linked ${session2.id} to ${task1.title}`);

    // 4. Complete a session with task linking
    console.log('\n🎯 Completing session with task linking...');
    const completion = await completeSessionWithTask(
      session3.id,
      task2.id,
      'Started writing endpoint documentation for user management APIs'
    );
    console.log(`✅ Completed ${session3.id} and linked to ${task2.title}\n`);

    // 5. Query linked data
    console.log('📊 Querying linked data...');

    // Get all sessions for task 1
    const task1Sessions = await getSessionsByTaskId(task1.id);
    console.log(`🔍 Task "${task1.title}" has ${task1Sessions.length} sessions:`);
    task1Sessions.forEach(session => {
      console.log(`   - Session ${session.id}: ${session.duration} minutes`);
    });

    // Get task for a specific session
    const linkedTask = await getTaskBySessionId(session1.id);
    console.log(`🔍 Session ${session1.id} is linked to: ${linkedTask?.title || 'none'}`);

    // Get comprehensive summary
    const summary = await getTaskSessionSummary(task1.id);
    if (summary) {
      console.log(`📈 Summary for "${summary.task.title}":`);
      console.log(`   - Total sessions: ${summary.sessions.length}`);
      console.log(`   - Completed sessions: ${summary.completedSessions}`);
      console.log(`   - Total time: ${summary.totalDuration} minutes`);
      console.log(`   - Estimated remaining: ${(summary.task.estimatedPomodoros || 0) - summary.completedSessions} sessions`);
    }

    // Get all linked sessions
    console.log('\n🔗 All linked sessions:');
    const allLinked = await getAllLinkedSessions({ sortBy: 'linkedAt', sortOrder: 'asc' });
    allLinked.forEach(linked => {
      console.log(`   - ${linked.session.id} → ${linked.task.title} (${linked.session.duration}min)`);
      if (linked.notes) {
        console.log(`     Notes: ${linked.notes}`);
      }
    });

    // 6. Test unlinking
    console.log('\n🔓 Testing unlinking...');
    const wasLinked = await isSessionLinked(session1.id);
    console.log(`Session ${session1.id} is linked: ${wasLinked}`);

    const unlinked = await unlinkSession(session1.id);
    console.log(`Unlinked session ${session1.id}: ${unlinked}`);

    const stillLinked = await isSessionLinked(session1.id);
    console.log(`Session ${session1.id} is still linked: ${stillLinked}`);

    console.log('\n✅ Demo completed successfully!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Export the demo function for potential use in tests
export { runDemo };

// Run the demo if this file is executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}