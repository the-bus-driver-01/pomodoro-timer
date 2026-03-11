import React, { useState } from 'react';
import useTaskManager from './hooks/useTaskManager';

/**
 * Test component to demonstrate useTaskManager hook usage
 * This verifies the acceptance criteria:
 * 1. Hook exports functions for addTask, editTask, deleteTask, and getTasks
 * 2. Tasks persist to localStorage and component re-renders on state changes
 */
const TestTaskComponent: React.FC = () => {
  const {
    tasks,
    loading,
    addTask,
    editTask,
    deleteTask,
    getTasks,
    getTaskById,
    toggleTaskComplete,
    getTasksByStatus
  } = useTaskManager();

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleAddTask = () => {
    if (newTitle.trim()) {
      addTask(newTitle, newDescription);
      setNewTitle('');
      setNewDescription('');
    }
  };

  const handleEditTask = (id: string) => {
    const task = getTaskById(id);
    if (task) {
      setEditingTaskId(id);
      setEditTitle(task.title);
      setEditDescription(task.description);
    }
  };

  const handleSaveEdit = () => {
    if (editingTaskId && editTitle.trim()) {
      editTask(editingTaskId, {
        title: editTitle,
        description: editDescription
      });
      setEditingTaskId(null);
      setEditTitle('');
      setEditDescription('');
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const handleToggleComplete = (id: string) => {
    toggleTaskComplete(id);
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  const completedTasks = getTasksByStatus(true);
  const pendingTasks = getTasksByStatus(false);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Task Manager Test Component</h1>

      {/* Add New Task Section */}
      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Add New Task</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: '300px', padding: '5px', marginRight: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            placeholder="Task description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            style={{ width: '300px', height: '60px', padding: '5px' }}
          />
        </div>
        <button onClick={handleAddTask} style={{ padding: '8px 16px' }}>
          Add Task
        </button>
      </div>

      {/* Edit Task Section */}
      {editingTaskId && (
        <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #007bff', borderRadius: '5px' }}>
          <h2>Edit Task</h2>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ width: '300px', padding: '5px', marginRight: '10px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              style={{ width: '300px', height: '60px', padding: '5px' }}
            />
          </div>
          <button onClick={handleSaveEdit} style={{ padding: '8px 16px', marginRight: '10px' }}>
            Save Changes
          </button>
          <button onClick={() => setEditingTaskId(null)} style={{ padding: '8px 16px' }}>
            Cancel
          </button>
        </div>
      )}

      {/* Tasks Display Section */}
      <div>
        <h2>All Tasks ({getTasks().length})</h2>
        <p>Completed: {completedTasks.length}, Pending: {pendingTasks.length}</p>

        {tasks.length === 0 ? (
          <p>No tasks yet. Add some tasks above!</p>
        ) : (
          <div>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  padding: '10px',
                  margin: '10px 0',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: task.completed ? '#f0f8f0' : '#fff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                    style={{ marginRight: '10px' }}
                  />
                  <h3 style={{
                    margin: 0,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#666' : '#000'
                  }}>
                    {task.title}
                  </h3>
                </div>
                <p style={{ margin: '5px 0', color: task.completed ? '#666' : '#333' }}>
                  {task.description}
                </p>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  <p>Created: {task.createdAt.toLocaleString()}</p>
                  <p>Updated: {task.updatedAt.toLocaleString()}</p>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => handleEditTask(task.id)}
                    style={{ padding: '5px 10px', marginRight: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo localStorage persistence */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>localStorage Integration Demo</h3>
        <p>
          Tasks are automatically persisted to localStorage. Try adding a task, then refresh the page -
          your tasks will still be there!
        </p>
        <p>Storage key: "tasks"</p>
        <button
          onClick={() => console.log('Current tasks in localStorage:', JSON.parse(localStorage.getItem('tasks') || '[]'))}
          style={{ padding: '5px 10px' }}
        >
          Log tasks to console
        </button>
      </div>
    </div>
  );
};

export default TestTaskComponent;