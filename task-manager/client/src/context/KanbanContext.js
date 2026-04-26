import React, { createContext, useState, useContext, useCallback } from 'react';
import { boardService, taskService, userService } from '../services/api';

const KanbanContext = createContext();

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};

export const KanbanProvider = ({ children }) => {
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  // Fetch all boards
  const fetchBoards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await boardService.getAll();
      setBoards(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch boards');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single board with its tasks
  const fetchBoard = useCallback(async (boardId) => {
    setLoading(true);
    setError(null);
    try {
      const boardResponse = await boardService.getById(boardId);
      // `/boards/:id` returns `{ board, tasks }`
      const board = boardResponse?.board || boardResponse;

      const boardTasks = Array.isArray(boardResponse?.tasks)
        ? boardResponse.tasks
        : await taskService.getByBoardId(boardId);

      setCurrentBoard(board);
      setTasks(boardTasks);
      return { board, tasks: boardTasks };
    } catch (err) {
      setError(err.message || 'Failed to fetch board');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new board
  const createBoard = useCallback(async (boardData) => {
    setLoading(true);
    setError(null);
    try {
      const newBoard = await boardService.create(boardData);
      setBoards(prev => [...prev, newBoard]);
      return newBoard;
    } catch (err) {
      setError(err.message || 'Failed to create board');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a board
  const updateBoard = useCallback(async (boardId, boardData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBoard = await boardService.update(boardId, boardData);
      setBoards(prev => prev.map(board => 
        board._id === boardId ? updatedBoard : board
      ));
      if (currentBoard && currentBoard._id === boardId) {
        setCurrentBoard(updatedBoard);
      }
      return updatedBoard;
    } catch (err) {
      setError(err.message || 'Failed to update board');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBoard]);

  // Delete a board
  const deleteBoard = useCallback(async (boardId) => {
    setLoading(true);
    setError(null);
    try {
      await boardService.delete(boardId);
      setBoards(prev => prev.filter(board => board._id !== boardId));
      if (currentBoard && currentBoard._id === boardId) {
        setCurrentBoard(null);
        setTasks([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete board');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBoard]);

  // Create a new task
  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err.message || 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      throw err;
    }
  }, []);

  // Update a task
  const updateTask = useCallback(async (taskId, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await taskService.update(taskId, taskData);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      setError(err.message || 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task._id !== taskId));
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reorder tasks (drag and drop)
  const reorderTasks = useCallback(async (reorderData) => {
    setLoading(true);
    setError(null);
    try {
      await taskService.reorder(reorderData);

      // Keep client ordering/status in sync with server after every drop.
      const refreshedTasks = await taskService.getByBoardId(reorderData.boardId);
      setTasks(refreshedTasks);
    } catch (err) {
      setError(err.message || 'Failed to reorder tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTaskComment = useCallback(async (taskId, commentBody) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await taskService.addComment(taskId, commentBody);
      setTasks((prev) => prev.map((task) => (task._id === taskId ? updatedTask : task)));
      return updatedTask;
    } catch (err) {
      setError(err.message || 'Failed to add comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTaskComment = useCallback(async (taskId, commentId) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await taskService.deleteComment(taskId, commentId);
      setTasks((prev) => prev.map((task) => (task._id === taskId ? updatedTask : task)));
      return updatedTask;
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get tasks by status
  const getTasksByStatus = useCallback((status) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.position - b.position);
  }, [tasks]);

  const clearCurrentBoard = useCallback(() => {
    setCurrentBoard(null);
    setTasks([]);
  }, []);

  const value = {
    boards,
    currentBoard,
    tasks,
    users,
    loading,
    error,
    fetchBoards,
    fetchBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    createTask,
    fetchUsers,
    updateTask,
    deleteTask,
    reorderTasks,
    addTaskComment,
    deleteTaskComment,
    getTasksByStatus,
    setCurrentBoard,
    clearCurrentBoard,
    clearError: () => setError(null)
  };

  return (
    <KanbanContext.Provider value={value}>
      {children}
    </KanbanContext.Provider>
  );
};
