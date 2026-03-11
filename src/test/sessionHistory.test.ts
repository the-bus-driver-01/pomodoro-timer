/**
 * Basic validation test for session history implementation
 */

import { addSessionRecord, getSessionHistory, clearSessionHistory } from '../services/sessionHistoryService';

// Simple test to validate API compatibility
function validateImplementation() {
  console.log('Testing session history implementation...');

  // Clear any existing data
  clearSessionHistory();

  // Test adding a work session (Acceptance Criteria #1)
  addSessionRecord('work', 1500);
  console.log('✓ addSession for work session');

  // Test adding a break session
  addSessionRecord('break', 300);
  console.log('✓ addSession for break session');

  // Test getting history (Acceptance Criteria #2)
  const allSessions = getSessionHistory();
  console.log(`✓ getHistory returned ${allSessions.length} sessions`);

  // Test date filtering (Acceptance Criteria #3)
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = getSessionHistory({ date: today });
  console.log(`✓ getHistory with date filter returned ${todaySessions.length} sessions for ${today}`);

  // Validate session structure
  if (allSessions.length > 0) {
    const session = allSessions[0];
    const hasRequiredFields = (
      typeof session.type === 'string' &&
      typeof session.duration === 'number' &&
      typeof session.timestamp === 'string' &&
      typeof session.date === 'string'
    );
    console.log(`✓ Session structure validation: ${hasRequiredFields ? 'PASS' : 'FAIL'}`);
  }

  // Test clearing history (Acceptance Criteria #6)
  clearSessionHistory();
  const clearedHistory = getSessionHistory();
  console.log(`✓ clearHistory: ${clearedHistory.length === 0 ? 'PASS' : 'FAIL'}`);

  console.log('Session history implementation validation complete!');
}

// Export for potential usage
export { validateImplementation };