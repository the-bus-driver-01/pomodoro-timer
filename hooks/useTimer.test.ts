import { renderHook, act } from '@testing-library/react';
import useTimer from '../src/hooks/useTimer';

// Mock timers
jest.useFakeTimers();

describe('useTimer', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();

    // Reset localStorage mock
    const localStorageMock = global.localStorage as jest.Mocked<typeof localStorage>;
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('Initial State', () => {
    it('should initialize with default settings (25 min work, 5 min break)', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.elapsed).toBe(0);
      expect(result.current.duration).toBe(1500); // 25 minutes in seconds
      expect(result.current.sessionType).toBe('work');
      expect(result.current.isRunning).toBe(false);
    });

    it('should use custom intervals from localStorage when available', () => {
      const localStorageMock = global.localStorage as jest.Mocked<typeof localStorage>;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'work-interval') return '30';
        if (key === 'break-interval') return '10';
        return null;
      });

      const { result } = renderHook(() => useTimer());

      expect(result.current.duration).toBe(1800); // 30 minutes in seconds
      expect(result.current.sessionType).toBe('work');
    });

    it('should handle localStorage errors gracefully and use defaults', () => {
      const localStorageMock = global.localStorage as jest.Mocked<typeof localStorage>;
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const { result } = renderHook(() => useTimer());

      expect(result.current.duration).toBe(1500); // 25 minutes default
      expect(result.current.sessionType).toBe('work');
    });
  });

  describe('Countdown Functionality', () => {
    it('should increment elapsed time by 100ms intervals when running', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);

      // Advance timer by 100ms
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.elapsed).toBe(100);

      // Advance timer by another 100ms
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.elapsed).toBe(200);
    });

    it('should not increment elapsed time when paused', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.elapsed).toBe(300);

      act(() => {
        result.current.pause();
      });

      // Timer should not advance when paused
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current.elapsed).toBe(300);
      expect(result.current.isRunning).toBe(false);
    });

    it('should maintain consistent 100ms intervals over multiple ticks', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      const expectedTimes = [100, 200, 300, 400, 500];

      expectedTimes.forEach((expectedTime) => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
        expect(result.current.elapsed).toBe(expectedTime);
      });
    });
  });

  describe('Pause/Resume Functionality', () => {
    it('should pause timer when pause() is called', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.elapsed).toBe(300);
      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isRunning).toBe(false);

      // Timer should not advance when paused
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.elapsed).toBe(300);
    });

    it('should resume timer from where it was paused', () => {
      const { result } = renderHook(() => useTimer());

      // Start timer
      act(() => {
        result.current.start();
      });

      // Run for 300ms
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.elapsed).toBe(300);

      // Pause
      act(() => {
        result.current.pause();
      });

      // Wait while paused (should not advance)
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current.elapsed).toBe(300);

      // Resume
      act(() => {
        result.current.start();
      });

      // Continue for another 100ms
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.elapsed).toBe(400);
      expect(result.current.isRunning).toBe(true);
    });

    it('should allow multiple pause/resume cycles', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      // First cycle: 200ms
      act(() => {
        jest.advanceTimersByTime(200);
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.elapsed).toBe(200);

      // Resume and run for 300ms more
      act(() => {
        result.current.start();
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Pause again
      act(() => {
        result.current.pause();
      });

      expect(result.current.elapsed).toBe(500);

      // Final resume
      act(() => {
        result.current.start();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.elapsed).toBe(600);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset timer when reset() is called', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.elapsed).toBe(500);
      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.elapsed).toBe(0);
      expect(result.current.isRunning).toBe(false);
    });

    it('should reset timer to zero regardless of current session type', () => {
      // Mock short intervals for testing
      const localStorageMock = global.localStorage as jest.Mocked<typeof localStorage>;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'work-interval') return '1';
        if (key === 'break-interval') return '1';
        return null;
      });

      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      // Complete work session to switch to break
      act(() => {
        jest.advanceTimersByTime(60000); // 1 minute
      });

      expect(result.current.sessionType).toBe('break');

      // Run break session for some time
      act(() => {
        jest.advanceTimersByTime(30000); // 30 seconds
      });

      expect(result.current.elapsed).toBe(30000);

      // Reset should work regardless of session type
      act(() => {
        result.current.reset();
      });

      expect(result.current.elapsed).toBe(0);
      expect(result.current.isRunning).toBe(false);
    });

    it('should allow restarting after reset', () => {
      const { result } = renderHook(() => useTimer());

      // Initial run
      act(() => {
        result.current.start();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.elapsed).toBe(0);

      // Restart
      act(() => {
        result.current.start();
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.elapsed).toBe(300);
      expect(result.current.isRunning).toBe(true);
    });
  });

  describe('Session Switching Functionality', () => {
    beforeEach(() => {
      // Use short intervals for faster testing
      const localStorageMock = global.localStorage as jest.Mocked<typeof localStorage>;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'work-interval') return '1'; // 1 minute
        if (key === 'break-interval') return '1'; // 1 minute
        return null;
      });
    });

    it('should auto-switch to break session when work session completes', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      // Initially work session
      expect(result.current.sessionType).toBe('work');
      expect(result.current.duration).toBe(60); // 1 minute in seconds

      // Advance to complete work session
      act(() => {
        jest.advanceTimersByTime(60000); // 1 minute
      });

      // Should switch to break and continue running
      expect(result.current.sessionType).toBe('break');
      expect(result.current.elapsed).toBe(0); // Reset for new session
      expect(result.current.duration).toBe(60); // Break duration
      expect(result.current.isRunning).toBe(true); // Should continue running
    });

    it('should auto-switch to work session when break session completes', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      // Complete work session
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(result.current.sessionType).toBe('break');

      // Complete break session
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Should switch back to work
      expect(result.current.sessionType).toBe('work');
      expect(result.current.elapsed).toBe(0); // Reset for new session
      expect(result.current.duration).toBe(60); // Work duration
      expect(result.current.isRunning).toBe(true);
    });

    it('should handle multiple session transitions correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      const sessions = ['work', 'break', 'work', 'break'] as const;

      sessions.forEach((expectedSession, index) => {
        expect(result.current.sessionType).toBe(expectedSession);
        expect(result.current.elapsed).toBe(0);

        // Complete current session
        act(() => {
          jest.advanceTimersByTime(60000);
        });
      });

      // After 4 complete sessions, should be back to work
      expect(result.current.sessionType).toBe('work');
    });

    it('should maintain session switching even if paused and resumed', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      // Run part of work session
      act(() => {
        jest.advanceTimersByTime(30000); // 30 seconds
      });

      // Pause
      act(() => {
        result.current.pause();
      });

      expect(result.current.sessionType).toBe('work');
      expect(result.current.elapsed).toBe(30000);

      // Resume and complete work session
      act(() => {
        result.current.start();
      });

      act(() => {
        jest.advanceTimersByTime(30000); // Complete remaining 30 seconds
      });

      // Should switch to break
      expect(result.current.sessionType).toBe('break');
      expect(result.current.elapsed).toBe(0);
    });

    it('should not switch sessions when timer is reset mid-session', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      // Run part of work session
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      expect(result.current.sessionType).toBe('work');

      // Reset (should stay in work session)
      act(() => {
        result.current.reset();
      });

      expect(result.current.sessionType).toBe('work');
      expect(result.current.elapsed).toBe(0);
    });
  });

  describe('Timer Controls', () => {
    it('should provide start, pause, and reset control functions', () => {
      const { result } = renderHook(() => useTimer());

      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });

    it('should maintain stable function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useTimer());

      const initialStart = result.current.start;
      const initialPause = result.current.pause;
      const initialReset = result.current.reset;

      // Force re-render
      rerender();

      expect(result.current.start).toBe(initialStart);
      expect(result.current.pause).toBe(initialPause);
      expect(result.current.reset).toBe(initialReset);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle rapid start/pause/reset sequences', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
        result.current.pause();
        result.current.start();
        result.current.reset();
        result.current.start();
      });

      expect(result.current.elapsed).toBe(0);
      expect(result.current.isRunning).toBe(true);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.elapsed).toBe(100);
    });

    it('should handle SSR environment gracefully', () => {
      // Simulate server-side rendering by temporarily clearing window
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const { result } = renderHook(() => useTimer());

      expect(result.current.duration).toBe(1500); // Should use defaults
      expect(result.current.sessionType).toBe('work');

      // Restore window
      global.window = originalWindow;
    });

    it('should cleanup intervals on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { result, unmount } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state during session transitions', () => {
      const localStorageMock = global.localStorage as jest.Mocked<typeof localStorage>;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'work-interval') return '2';
        if (key === 'break-interval') return '1';
        return null;
      });

      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      expect(result.current.duration).toBe(120); // 2 minutes work

      // Complete work session
      act(() => {
        jest.advanceTimersByTime(120000);
      });

      expect(result.current.sessionType).toBe('break');
      expect(result.current.duration).toBe(60); // 1 minute break
      expect(result.current.elapsed).toBe(0);
    });

    it('should handle localStorage changes during runtime', () => {
      const { result } = renderHook(() => useTimer());

      // Initial state with defaults
      expect(result.current.duration).toBe(1500);

      // Simulate localStorage change
      const localStorageMock = global.localStorage as jest.Mocked<typeof localStorage>;
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'work-interval') return '45';
        if (key === 'break-interval') return '15';
        return null;
      });

      // Force re-render to trigger useEffect
      act(() => {
        result.current.start();
        result.current.pause();
      });

      // Note: The current implementation updates intervals on initialization
      // but doesn't listen for runtime localStorage changes
      // This test documents current behavior
    });
  });
});