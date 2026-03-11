import { useState, useEffect, useCallback } from 'react';

// Step 1: Define TypeScript interfaces and types for task management
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskManager {
  tasks: Task[];
  loading: boolean;
  addTask: (title: string, description: string) => void;
  editTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  getTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  toggleTaskComplete: (id: string) => void;
  getTasksByStatus: (completed: boolean) => Task[];
}

// Task data for creation (without generated fields)
export interface CreateTaskData {
  title: string;
  description: string;
}

const STORAGE_KEY = 'tasks';

// Step 2: Implement localStorage storage utilities
const getTasksFromStorage = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
    return [];
  }
};

const saveTasksToStorage = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error);
  }
};

// Custom hook implementation
const useTaskManager = (): TaskManager => {
  // Step 3: Set up React hook state management with useState
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Step 4: Implement useEffect for initial data loading
  useEffect(() => {
    const loadTasks = () => {
      try {
        const storedTasks = getTasksFromStorage();
        setTasks(storedTasks);
      } catch (error) {
        console.error('Error initializing tasks:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Step 5: Implement addTask function
  const addTask = useCallback((title: string, description: string): void => {
    const now = new Date();
    const newTask: Task = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasksToStorage(updatedTasks);
  }, [tasks]);

  // Step 6: Implement editTask function
  const editTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): void => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          ...updates,
          updatedAt: new Date()
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    saveTasksToStorage(updatedTasks);
  }, [tasks]);

  // Step 7: Implement deleteTask function
  const deleteTask = useCallback((id: string): void => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasksToStorage(updatedTasks);
  }, [tasks]);

  // Step 8: Implement getTasks and utility functions
  const getTasks = useCallback((): Task[] => {
    return tasks;
  }, [tasks]);

  const getTaskById = useCallback((id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  const toggleTaskComplete = useCallback((id: string): void => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      editTask(id, { completed: !task.completed });
    }
  }, [tasks, editTask]);

  const getTasksByStatus = useCallback((completed: boolean): Task[] => {
    return tasks.filter(task => task.completed === completed);
  }, [tasks]);

  // Step 10: Export hook interface and implement return object
  return {
    tasks,
    loading,
    addTask,
    editTask,
    deleteTask,
    getTasks,
    getTaskById,
    toggleTaskComplete,
    getTasksByStatus
  };
};

export default useTaskManager;