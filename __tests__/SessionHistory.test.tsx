import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SessionHistory from '@/components/SessionHistory';
import { SessionWithTask, SessionStatus } from '@/types';

// Mock the hooks
jest.mock('@/hooks/useSessions');

const mockUseSessions = require('@/hooks/useSessions').useSessions as jest.Mock;

// Mock date-fns to have consistent test results
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') return '2024-03-11';
    if (formatStr === 'HH:mm') return '14:30';
    if (formatStr === 'EEEE, MMMM d, yyyy') return 'Monday, March 11, 2024';
    return date.toString();
  }),
  isToday: jest.fn(() => true),
  isYesterday: jest.fn(() => false),
  startOfWeek: jest.fn(() => new Date('2024-03-11')),
  endOfWeek: jest.fn(() => new Date('2024-03-17')),
  subWeeks: jest.fn(() => new Date('2024-03-04')),
}));

describe('SessionHistory', () => {
  const mockSessions: SessionWithTask[] = [
    {
      id: '1',
      taskId: 'task-1',
      startTime: new Date('2024-03-11T14:00:00'),
      endTime: new Date('2024-03-11T14:25:00'),
      duration: 25 * 60 * 1000, // 25 minutes
      status: SessionStatus.COMPLETED,
      type: 'work',
      createdAt: new Date('2024-03-11T14:00:00'),
      updatedAt: new Date('2024-03-11T14:25:00'),
      task: {
        id: 'task-1',
        name: 'Test Task',
        description: 'A test task for unit testing',
        status: 'in_progress' as any,
        priority: 'high' as any,
        completedPomodoros: 1,
        createdAt: new Date('2024-03-11T10:00:00'),
        updatedAt: new Date('2024-03-11T14:25:00'),
      },
    },
    {
      id: '2',
      taskId: 'task-2',
      startTime: new Date('2024-03-11T15:00:00'),
      endTime: null,
      duration: 15 * 60 * 1000, // 15 minutes so far
      status: SessionStatus.IN_PROGRESS,
      type: 'work',
      createdAt: new Date('2024-03-11T15:00:00'),
      updatedAt: new Date('2024-03-11T15:15:00'),
      task: {
        id: 'task-2',
        name: 'Another Task',
        description: 'Another task for testing',
        status: 'in_progress' as any,
        priority: 'medium' as any,
        completedPomodoros: 0,
        createdAt: new Date('2024-03-11T12:00:00'),
        updatedAt: new Date('2024-03-11T15:15:00'),
      },
    },
  ];

  const defaultMockReturn = {
    sessions: mockSessions,
    loading: false,
    error: null,
    refetch: jest.fn(),
    addSession: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    stats: {
      totalSessions: 2,
      completedSessions: 1,
      totalDuration: 25 * 60 * 1000,
      averageDuration: 25 * 60 * 1000,
    },
  };

  beforeEach(() => {
    mockUseSessions.mockReturnValue(defaultMockReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the session history component', () => {
      render(<SessionHistory />);

      expect(screen.getByText(/Session History/)).toBeInTheDocument();
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Another Task')).toBeInTheDocument();
    });

    it('displays session count in header', () => {
      render(<SessionHistory />);

      expect(screen.getByText('Session History (2)')).toBeInTheDocument();
    });

    it('groups sessions by date', () => {
      render(<SessionHistory />);

      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton when loading', () => {
      mockUseSessions.mockReturnValue({
        ...defaultMockReturn,
        loading: true,
        sessions: [],
      });

      render(<SessionHistory />);

      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });

    it('shows error state when there is an error', () => {
      const errorMessage = 'Failed to load sessions';
      mockUseSessions.mockReturnValue({
        ...defaultMockReturn,
        loading: false,
        error: errorMessage,
        sessions: [],
      });

      render(<SessionHistory />);

      expect(screen.getByText('Error Loading Sessions')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('calls refetch when try again button is clicked', async () => {
      const mockRefetch = jest.fn();
      mockUseSessions.mockReturnValue({
        ...defaultMockReturn,
        loading: false,
        error: 'Test error',
        sessions: [],
        refetch: mockRefetch,
      });

      render(<SessionHistory />);

      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no sessions', () => {
      mockUseSessions.mockReturnValue({
        ...defaultMockReturn,
        sessions: [],
      });

      render(<SessionHistory />);

      expect(screen.getByText('No Sessions Found')).toBeInTheDocument();
      expect(screen.getByText("You haven't started any Pomodoro sessions yet.")).toBeInTheDocument();
    });

    it('shows filtered empty state with clear filters option', () => {
      mockUseSessions.mockReturnValue({
        ...defaultMockReturn,
        sessions: [],
      });

      // Simulate having sessions in the hook but none after filtering
      const originalReturn = { ...defaultMockReturn, sessions: mockSessions };
      mockUseSessions.mockReturnValueOnce(originalReturn);

      render(<SessionHistory initialFilters={{ status: SessionStatus.INTERRUPTED }} />);

      // Re-mock for the filtered state
      mockUseSessions.mockReturnValue({
        ...defaultMockReturn,
        sessions: [],
      });

      // Re-render to simulate filter effect
      render(<SessionHistory />);

      expect(screen.getByText('No Sessions Found')).toBeInTheDocument();
    });
  });

  describe('Filtering and Sorting', () => {
    it('allows changing date range filter', async () => {
      render(<SessionHistory />);

      const dateRangeSelect = screen.getByDisplayValue('All Time');
      fireEvent.change(dateRangeSelect, { target: { value: 'today' } });

      expect(dateRangeSelect).toHaveValue('today');
    });

    it('allows changing sort options', async () => {
      render(<SessionHistory />);

      const durationSortButton = screen.getByText('Duration');
      fireEvent.click(durationSortButton);

      // Check if sort indicator appears
      expect(screen.getByText('Duration')).toBeInTheDocument();
    });

    it('toggles sort order when clicking the same sort option', async () => {
      render(<SessionHistory />);

      const timeSortButton = screen.getByText('Time');

      // First click should show descending (default)
      expect(timeSortButton).toHaveTextContent('Time ↓');

      // Second click should toggle to ascending
      fireEvent.click(timeSortButton);
      await waitFor(() => {
        expect(timeSortButton).toHaveTextContent('Time ↑');
      });
    });
  });

  describe('Session Display', () => {
    it('displays completed sessions correctly', () => {
      render(<SessionHistory />);

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('25m')).toBeInTheDocument();
    });

    it('displays in-progress sessions correctly', () => {
      render(<SessionHistory />);

      expect(screen.getByText('Another Task')).toBeInTheDocument();
      expect(screen.getByText('15m')).toBeInTheDocument();
    });

    it('displays sessions without tasks', () => {
      const sessionWithoutTask = {
        ...mockSessions[0],
        taskId: null,
        task: null,
      };

      mockUseSessions.mockReturnValue({
        ...defaultMockReturn,
        sessions: [sessionWithoutTask],
      });

      render(<SessionHistory />);

      expect(screen.getByText('Untitled Session')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<SessionHistory />);

      const mainHeading = screen.getByRole('heading', { name: /Session History/ });
      expect(mainHeading).toBeInTheDocument();

      const dateHeading = screen.getByRole('heading', { name: /Today/ });
      expect(dateHeading).toBeInTheDocument();
    });

    it('has accessible form controls', () => {
      render(<SessionHistory />);

      const dateRangeSelect = screen.getByRole('combobox');
      expect(dateRangeSelect).toBeInTheDocument();
      expect(dateRangeSelect).toHaveAccessibleName();

      const sortButtons = screen.getAllByRole('button', { name: /Time|Duration|Status/ });
      expect(sortButtons.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', () => {
      render(<SessionHistory />);

      const dateRangeSelect = screen.getByRole('combobox');
      dateRangeSelect.focus();
      expect(document.activeElement).toBe(dateRangeSelect);

      const sortButtons = screen.getAllByRole('button');
      sortButtons.forEach(button => {
        button.focus();
        expect(document.activeElement).toBe(button);
      });
    });

    it('has proper ARIA labels and descriptions', () => {
      render(<SessionHistory />);

      const mainContainer = screen.getByRole('main') || screen.getByTestId('session-history-main');
      if (mainContainer) {
        expect(mainContainer).toHaveAttribute('aria-label');
      }
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to different screen sizes', () => {
      const { container } = render(<SessionHistory />);

      // Test that responsive classes are applied
      const headerElement = container.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(headerElement).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large numbers of sessions efficiently', () => {
      const largeMockSessions = Array.from({ length: 100 }, (_, i) => ({
        ...mockSessions[0],
        id: `session-${i}`,
        startTime: new Date(`2024-03-${Math.floor(i / 10) + 1}T${10 + (i % 10)}:00:00`),
      }));

      mockUseSessions.mockReturnValue({
        ...defaultMockReturn,
        sessions: largeMockSessions,
      });

      const startTime = performance.now();
      render(<SessionHistory />);
      const endTime = performance.now();

      // Rendering should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});