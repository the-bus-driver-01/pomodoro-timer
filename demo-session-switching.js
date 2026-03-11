// Simple demonstration of session switching logic
// This simulates the core logic without React hooks

class PomodoroTimer {
  constructor() {
    this.isRunning = false;
    this.elapsed = 0;
    this.sessionType = 'work';
    this.settings = {
      workInterval: 25 * 60, // 25 minutes in seconds
      breakInterval: 5 * 60   // 5 minutes in seconds
    };
    this.onSessionComplete = null;
    this.intervalId = null;
  }

  getCurrentDuration() {
    return this.sessionType === 'work' ? this.settings.workInterval : this.settings.breakInterval;
  }

  completeSession() {
    const completedSessionType = this.sessionType;
    const completedDuration = this.getCurrentDuration();
    const timestamp = new Date();

    console.log(`Completed ${completedSessionType} session (${completedDuration}s)`);

    // Switch session type
    this.sessionType = this.sessionType === 'work' ? 'break' : 'work';
    this.elapsed = 0;

    console.log(`Switched to ${this.sessionType} session`);

    // Call completion callback if provided
    if (this.onSessionComplete) {
      this.onSessionComplete({
        type: completedSessionType,
        duration: completedDuration,
        timestamp
      });
    }
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log(`Starting ${this.sessionType} session (${this.getCurrentDuration()}s duration)`);

    this.intervalId = setInterval(() => {
      this.elapsed++;
      const currentDuration = this.getCurrentDuration();

      // Check if session is complete
      if (this.elapsed >= currentDuration) {
        this.completeSession();
        // In real implementation, elapsed would be set to 0 by completeSession
        // but for demo we need to handle it here since we're simulating
      }

      // Show progress every 5 seconds or on completion
      if (this.elapsed % 5 === 0 || this.elapsed >= currentDuration) {
        console.log(`${this.sessionType} session: ${this.elapsed}/${currentDuration}s (${Math.round((this.elapsed/currentDuration)*100)}%)`);
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log(`Paused ${this.sessionType} session at ${this.elapsed}s`);
  }

  updateSettings(newSettings) {
    this.settings = { ...newSettings };
    console.log(`Settings updated: work=${this.settings.workInterval}s, break=${this.settings.breakInterval}s`);
  }
}

// Demo: Test session switching
console.log('=== Session Switching Demo ===\n');

const timer = new PomodoroTimer();

// Set callback to log session completions
timer.onSessionComplete = (sessionData) => {
  console.log(`SESSION COMPLETE: ${sessionData.type} (${sessionData.duration}s) at ${sessionData.timestamp.toLocaleTimeString()}\n`);
};

// Use shorter intervals for demo (5 seconds work, 3 seconds break)
timer.updateSettings({
  workInterval: 5,
  breakInterval: 3
});

// Demo 1: Normal session switching
console.log('Demo 1: Normal session switching');
timer.start();

// Let it run for work session + break session + part of next work session
setTimeout(() => {
  timer.pause();
  console.log('\n--- Demo complete ---\n');

  // Demo 2: Settings change during break
  console.log('Demo 2: Settings change during break session');

  // Reset and start again
  timer.elapsed = 0;
  timer.sessionType = 'work';
  timer.start();

  // Complete work session
  setTimeout(() => {
    console.log('Work session should be completed, now in break...');

    // Change work interval during break
    timer.updateSettings({
      workInterval: 8, // Changed from 5 to 8 seconds
      breakInterval: 3
    });

    // Let break complete and see new work duration
    setTimeout(() => {
      console.log(`New work session duration: ${timer.getCurrentDuration()}s`);
      timer.pause();
      console.log('\n--- All demos complete ---');
      process.exit(0);
    }, 4000); // Wait for break to complete

  }, 6000); // Wait for work session to complete

}, 10000); // Wait for initial demo

console.log('Demo running... (will complete automatically)\n');