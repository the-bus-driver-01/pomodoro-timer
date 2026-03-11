export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedPomodoros?: number;
  completedPomodoros: number;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags?: string[];
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  search?: string;
}

export interface TaskSortOptions {
  sortBy: 'name' | 'createdAt' | 'dueDate' | 'priority';
  sortOrder: 'asc' | 'desc';
}