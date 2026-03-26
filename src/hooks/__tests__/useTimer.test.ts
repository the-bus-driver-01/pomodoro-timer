import { renderHook, act } from '@testing-library/react';
import useTimer from '../useTimer';

// Mock timers
jest.useFakeTimers();

describe('useTimer', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  // Acceptance Criteria 1: Hook initialization with default settings
  it('should initialize with default settings (25 min work, 5 min break)', () => {
    const { result } = renderHook(() => useTimer());

    expect(result.current.elapsed).toBe(0);
    expect(result.current.duration).toBe(1500); // 25 minutes in seconds
    expect(result.current.sessionType).toBe('work');
    expect(result.current.isRunning).toBe(false);
  });

  // Acceptance Criteria 2: Timer increments by ~100ms when running
  it('should increment elapsed time by ~100ms when running', () => {
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

  // Acceptance Criteria 3: Session toggle when elapsed >= duration
  it('should toggle session type and reset elapsed when duration is reached', () => {
    // Mock short intervals for testing
    (localStorage.getItem as jest.Mock)
      .mockReturnValueOnce('1') // 1 minute work
      .mockReturnValueOnce('1'); // 1 minute break

    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    // Initially work session
    expect(result.current.sessionType).toBe('work');
    expect(result.current.duration).toBe(60);

    // Advance to just before duration
    act(() => {
      jest.advanceTimersByTime(59900); // 59.9 seconds
    });

    expect(result.current.elapsed).toBe(59900);
    expect(result.current.sessionType).toBe('work');

    // Advance past duration
    act(() => {
      jest.advanceTimersByTime(200); // 0.2 seconds more
    });

    // Should switch to break and reset elapsed
    expect(result.current.sessionType).toBe('break');
    expect(result.current.elapsed).toBe(100); // New session started with 100ms
    expect(result.current.duration).toBe(60); // Break duration

    // Continue to next toggle
    act(() => {
      jest.advanceTimersByTime(59900); // Complete the break
    });

    // Should switch back to work
    expect(result.current.sessionType).toBe('work');
    expect(result.current.elapsed).toBe(0);
  });

  // Acceptance Criteria 4: start() functionality
  it('should start timer when start() is called', () => {
    const { result } = renderHook(() => useTimer());

    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    // Verify timer is actually running
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.elapsed).toBe(500);
  });

  // Acceptance Criteria 5: pause() functionality
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
      jest.advanceTimersByTime(200);
    });

    expect(result.current.elapsed).toBe(300); // Should remain the same
  });

  // Acceptance Criteria 6: reset() functionality
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

  // Acceptance Criteria 7: Custom intervals from localStorage
  it('should use custom intervals from localStorage', () => {
    // Mock custom intervals: 30 min work, 10 min break
    (localStorage.getItem as jest.Mock)
      .mockImplementation((key: string) => {
        if (key === 'work-interval') return '30';
        if (key === 'break-interval') return '10';
        return null;
      });

    const { result } = renderHook(() => useTimer());

    expect(result.current.duration).toBe(1800); // 30 minutes in seconds
    expect(result.current.sessionType).toBe('work');

    // Manually switch to break session to test break duration
    act(() => {
      result.current.start();
    });

    // Mock reaching the work duration
    (localStorage.getItem as jest.Mock)
      .mockImplementation((key: string) => {
        if (key === 'work-interval') return '30';
        if (key === 'break-interval') return '10';
        return null;
      });

    act(() => {
      jest.advanceTimersByTime(1800000); // 30 minutes
    });

    expect(result.current.sessionType).toBe('break');
    expect(result.current.duration).toBe(600); // 10 minutes in seconds
  });

  // Test pause and resume functionality
  it('should resume timer from where it was paused', () => {
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

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.elapsed).toBe(300); // Should not change

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.elapsed).toBe(400); // Should resume from 300
  });

  // Test error handling for localStorage
  it('should handle localStorage errors gracefully', () => {
    (localStorage.getItem as jest.Mock)
      .mockImplementation(() => {
        throw new Error('localStorage not available');
      });

    const { result } = renderHook(() => useTimer());

    // Should fall back to defaults
    expect(result.current.duration).toBe(1500); // 25 minutes default
    expect(result.current.sessionType).toBe('work');
  });
});