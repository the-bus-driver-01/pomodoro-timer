import React, { useState } from 'react';
import './TaskList.css';

// TypeScript interfaces
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskListProps {
  className?: string;
}

// Placeholder for useTaskManager hook - will be imported when available
interface TaskManagerHook {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  deleteTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

// Mock useTaskManager for now - this should be replaced with actual import
const useTaskManager = (): TaskManagerHook => {
  // This is a placeholder implementation
  return {
    tasks: [],
    loading: false,
    error: null,
    deleteTask: async (taskId: string) => {},
    updateTask: async (taskId: string, updates: Partial<Task>) => {},
    createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {},
  };
};

export const TaskList: React.FC<TaskListProps> = ({ className }) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [announcementMessage, setAnnouncementMessage] = useState<string>('');
  const [operationLoading, setOperationLoading] = useState<{
    [taskId: string]: 'updating' | 'toggling' | null;
  }>({});
  const [userError, setUserError] = useState<string | null>(null);

  // Get tasks data from useTaskManager hook
  const { tasks, loading, error, deleteTask, updateTask } = useTaskManager();

  // Accessibility announcement helper
  const announceToScreenReader = (message: string) => {
    setAnnouncementMessage(message);
    setTimeout(() => setAnnouncementMessage(''), 1000);
  };

  // Error handling helper
  const showUserError = (message: string) => {
    setUserError(message);
    announceToScreenReader(message);
    setTimeout(() => setUserError(null), 5000);
  };

  // Loading state helpers
  const setTaskLoading = (taskId: string, operation: 'updating' | 'toggling' | null) => {
    setOperationLoading(prev => ({
      ...prev,
      [taskId]: operation
    }));
  };

  // Event handlers
  const handleEditStart = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    announceToScreenReader(`Editing task: ${task.title}`);
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
    setEditingTitle('');
    announceToScreenReader('Edit cancelled');
  };

  const handleEditSave = async (taskId: string) => {
    if (!editingTitle.trim()) {
      showUserError('Task title cannot be empty');
      return;
    }

    setTaskLoading(taskId, 'updating');

    try {
      await updateTask(taskId, {
        title: editingTitle.trim(),
        updatedAt: new Date()
      });
      setEditingTaskId(null);
      setEditingTitle('');
      announceToScreenReader('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      showUserError(`Update failed: ${errorMessage}`);
    } finally {
      setTaskLoading(taskId, null);
    }
  };

  const handleDelete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const taskTitle = task?.title || 'task';

    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`);
    if (!confirmed) {
      announceToScreenReader('Delete cancelled');
      return;
    }

    setIsDeleting(taskId);

    try {
      await deleteTask(taskId);
      announceToScreenReader(`Task "${taskTitle}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      showUserError(`Delete failed: ${errorMessage}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    setTaskLoading(task.id, 'toggling');

    try {
      await updateTask(task.id, {
        completed: !task.completed,
        updatedAt: new Date()
      });
      const status = !task.completed ? 'completed' : 'marked as incomplete';
      announceToScreenReader(`Task "${task.title}" ${status}`);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      showUserError(`Status update failed: ${errorMessage}`);
    } finally {
      setTaskLoading(task.id, null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, taskId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleEditSave(taskId);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleEditCancel();
    }
  };

  const handleTaskItemKeyDown = (event: React.KeyboardEvent, task: Task) => {
    // Enable keyboard navigation for task items
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (editingTaskId !== task.id) {
          handleToggleComplete(task);
        }
        break;
      case 'e':
      case 'E':
        if (editingTaskId !== task.id && !event.ctrlKey && !event.altKey) {
          event.preventDefault();
          handleEditStart(task);
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (editingTaskId !== task.id && !event.ctrlKey && !event.altKey) {
          event.preventDefault();
          handleDelete(task.id);
        }
        break;
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className={`task-list ${className || ''}`}>
        <h2>Task List</h2>
        <div className="loading-spinner" role="status" aria-label="Loading tasks">
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={`task-list ${className || ''}`}>
        <h2>Task List</h2>
        <div className="error-message" role="alert">
          <span>Error loading tasks: {error}</span>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (tasks.length === 0) {
    return (
      <div className={`task-list ${className || ''}`}>
        <h2>Task List</h2>
        <div className="empty-state">
          <p>No tasks available. Create your first task to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-list ${className || ''}`} role="region" aria-label="Task Management">
      {/* Screen reader announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcementMessage}
      </div>

      {/* User error display */}
      {userError && (
        <div className="user-error-message" role="alert" aria-live="assertive">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>{userError}</span>
          <button
            onClick={() => setUserError(null)}
            className="error-dismiss-btn"
            aria-label="Dismiss error message"
            type="button"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      )}

      <h2 id="task-list-heading">Task List</h2>
      <div
        className="task-list-container"
        role="list"
        aria-labelledby="task-list-heading"
        aria-describedby="task-list-description"
      >
        <div id="task-list-description" className="sr-only">
          Use Space or Enter to toggle completion, E to edit, Delete to remove tasks.
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} available.
        </div>

        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`}
            role="listitem"
            tabIndex={editingTaskId === task.id ? -1 : 0}
            onKeyDown={(e) => handleTaskItemKeyDown(e, task)}
            aria-labelledby={`task-title-${task.id}`}
            aria-describedby={`task-meta-${task.id} task-actions-${task.id}`}
          >
            <div className="task-content">
              <div className="task-checkbox">
                <input
                  type="checkbox"
                  id={`task-checkbox-${task.id}`}
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task)}
                  disabled={operationLoading[task.id] === 'toggling' || editingTaskId === task.id}
                  aria-describedby={`task-title-${task.id}`}
                  className="task-checkbox-input"
                />
                <label htmlFor={`task-checkbox-${task.id}`} className="sr-only">
                  {operationLoading[task.id] === 'toggling'
                    ? 'Updating task status...'
                    : `Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`
                  }
                </label>
                {operationLoading[task.id] === 'toggling' && (
                  <span className="checkbox-loading-indicator" aria-hidden="true">⏳</span>
                )}
              </div>
              {editingTaskId === task.id ? (
                <div className="task-edit-container" role="form" aria-label="Edit task">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, task.id)}
                    className="task-title-input"
                    aria-label="Task title"
                    aria-describedby={`task-edit-help-${task.id}`}
                    autoFocus
                    required
                  />
                  <div id={`task-edit-help-${task.id}`} className="sr-only">
                    Press Enter to save, Escape to cancel
                  </div>
                </div>
              ) : (
                <div className="task-details">
                  <h3 id={`task-title-${task.id}`} className="task-title">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="task-description" id={`task-description-${task.id}`}>
                      {task.description}
                    </p>
                  )}
                  <div className="task-meta" id={`task-meta-${task.id}`}>
                    <span
                      className={`priority-badge priority-${task.priority}`}
                      aria-label={`Priority: ${task.priority}`}
                    >
                      {task.priority}
                    </span>
                    <span className="task-status" aria-label={`Status: ${task.completed ? 'Completed' : 'Pending'}`}>
                      {task.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="task-actions" id={`task-actions-${task.id}`} role="group" aria-label="Task actions">
              {editingTaskId === task.id ? (
                <div className="edit-actions" role="group" aria-label="Edit actions">
                  <button
                    onClick={() => handleEditSave(task.id)}
                    className="btn btn-save"
                    aria-label="Save changes to task"
                    aria-describedby={!editingTitle.trim() ? `save-help-${task.id}` : undefined}
                    disabled={!editingTitle.trim() || operationLoading[task.id] === 'updating'}
                    type="button"
                  >
                    {operationLoading[task.id] === 'updating' ? (
                      <>
                        <span aria-hidden="true">⏳</span> Saving...
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">✓</span> Save
                      </>
                    )}
                  </button>
                  {!editingTitle.trim() && (
                    <div id={`save-help-${task.id}`} className="sr-only">
                      Task title is required to save
                    </div>
                  )}
                  <button
                    onClick={handleEditCancel}
                    className="btn btn-cancel"
                    aria-label="Cancel editing and discard changes"
                    disabled={operationLoading[task.id] === 'updating'}
                    type="button"
                  >
                    <span aria-hidden="true">✕</span> Cancel
                  </button>
                </div>
              ) : (
                <div className="task-actions-buttons" role="group" aria-label="Task actions">
                  <button
                    onClick={() => handleEditStart(task)}
                    className="btn btn-edit"
                    aria-label={`Edit task: ${task.title}`}
                    disabled={
                      operationLoading[task.id] === 'updating' ||
                      operationLoading[task.id] === 'toggling' ||
                      isDeleting === task.id
                    }
                    type="button"
                  >
                    <span aria-hidden="true">✏️</span> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="btn btn-delete"
                    aria-label={`Delete task: ${task.title}`}
                    disabled={
                      isDeleting === task.id ||
                      operationLoading[task.id] === 'updating' ||
                      operationLoading[task.id] === 'toggling'
                    }
                    type="button"
                    aria-describedby={isDeleting === task.id ? `delete-status-${task.id}` : undefined}
                  >
                    {isDeleting === task.id ? (
                      <>
                        <span aria-hidden="true">⏳</span> Deleting...
                        <span id={`delete-status-${task.id}`} className="sr-only">
                          Deleting task in progress
                        </span>
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">🗑️</span> Delete
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;