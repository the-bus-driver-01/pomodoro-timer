import { Task } from './task';

export enum SessionStatus {
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
  IN_PROGRESS = 'in_progress',
  PLANNED = 'planned'
}

export interface PomodoroSession {
  id: string;
  taskId: string | null;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in milliseconds
  status: SessionStatus;
  type: 'work' | 'short_break' | 'long_break';
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionWithTask extends PomodoroSession {
  task?: Task | null;
}

export interface SessionFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  taskId?: string;
  status?: SessionStatus;
  type?: 'work' | 'short_break' | 'long_break';
}

export interface SessionSortOptions {
  sortBy: 'startTime' | 'duration' | 'status';
  sortOrder: 'asc' | 'desc';
}

export type SessionListView = 'list' | 'grid' | 'compact';

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  totalDuration: number;
  averageDuration: number;
}