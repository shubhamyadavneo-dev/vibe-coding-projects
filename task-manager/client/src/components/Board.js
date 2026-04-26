import React, { useEffect, useMemo, useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Column from './Column';
import TaskForm from './TaskForm';
import ModalPortal from './ModalPortal';
import { useKanban } from '../context/KanbanContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useAuth } from '../context/AuthContext';

const Board = ({ onBoardDeleted }) => {
  const {
    currentBoard,
    tasks,
    createTask,
    fetchUsers,
    users,
    addTaskComment,
    deleteTaskComment,
    updateBoard,
    setCurrentBoard,
    updateTask,
    deleteTask,
    loading,
    error
  } = useKanban();
  const { user: currentUser } = useAuth();

  const { handleDragEnd } = useDragAndDrop();
  const [activeTask, setActiveTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskStatus, setTaskStatus] = useState('Todo');
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [columnDraft, setColumnDraft] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    assignedUser: '',
    status: '',
    taskName: '',
    priority: ''
  });

  useEffect(() => {
    fetchUsers().catch(() => { });
  }, [fetchUsers]);

  useEffect(() => {
    if (!editingTask) {
      return;
    }

    const freshTask = tasks.find((task) => task._id === editingTask._id);
    if (freshTask) {
      setEditingTask(freshTask);
    }
  }, [editingTask, tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTask = (status) => {
    setTaskStatus(status);
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await updateTask(editingTask._id, taskData);
    } else {
      const resolvedBoardId = taskData?.boardId || currentBoard?.board?._id || currentBoard?.id;
      console.log("create task", taskData, resolvedBoardId);
      console.log("currentBaord::", currentBoard);

      await createTask({
        ...taskData,
        boardId: resolvedBoardId
      });
    }
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const columns = useMemo(() => {
    if (Array.isArray(currentBoard?.columns) && currentBoard.columns.length > 0) {
      return currentBoard.columns;
    }
    return ['Todo', 'In Progress', 'Done'];
  }, [currentBoard]);

  useEffect(() => {
    if (showColumnManager) {
      setColumnDraft(columns);
    }
  }, [columns, showColumnManager]);

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Board Selected</h2>
          <p className="text-gray-600">Please select or create a board to get started.</p>
        </div>
      </div>
    );
  }

  // Filter tasks based on current filters
  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      // Filter by assigned user
      if (filters.assignedUser) {
        const assigneeId = task.assignee?._id || task.assignee;
        if (assigneeId !== filters.assignedUser) {
          return false;
        }
      }

      // Filter by status
      if (filters.status && task.status !== filters.status) {
        return false;
      }

      // Filter by task name
      if (filters.taskName.trim() && !task.title.toLowerCase().includes(filters.taskName.toLowerCase())) {
        return false;
      }

      // Filter by priority
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      return true;
    });
  };

  const filteredTasks = getFilteredTasks();

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({
      assignedUser: '',
      status: '',
      taskName: '',
      priority: ''
    });
  };

  return (
    <div className="p-3 sm:p-6 min-h-[90dvh]">
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {/* Board Header */}
      <div className="mb-8">
        <div className="mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{currentBoard.name}</h1>
              <p className="text-gray-600 mt-1">{currentBoard.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowColumnManager(true)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reorder columns
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-gray-600 sm:flex-row sm:items-center">
          <span className="mr-0 sm:mr-4">Columns: {columns.join(', ')}</span>
          <span className="text-sm">Total Tasks: {filteredTasks.length} {tasks.length !== filteredTasks.length && `(filtered from ${tasks.length})`}</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Filters</h3>
          {(filters.assignedUser || filters.status || filters.taskName.trim() || filters.priority) && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Task Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
            <input
              type="text"
              value={filters.taskName}
              onChange={(e) => handleFilterChange('taskName', e.target.value)}
              placeholder="Search tasks..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Assigned User Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned User</label>
            <select
              value={filters.assignedUser}
              onChange={(e) => handleFilterChange('assignedUser', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
            >
              <option value="">Select a user...</option>
              {users?.length > 0 ? (
                users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))
              ) : (
                <option disabled>No users available</option>
              )}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
            >
              <option value="">Select status...</option>
              {columns.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
            >
              <option value="">Select priority...</option>
              {['low', 'medium', 'high'].map((priority) => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Drag and Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={(event) => {
          if (event.active.data.current?.type === 'task') {
            setActiveTask(event.active.data.current.task);
          }
        }}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter(task => task.status === column);
            return (
              <Column
                key={column}
                status={column}
                title={column}
                tasks={columnTasks}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="p-4 opacity-90 bg-white rounded-lg shadow-lg border border-gray-200">
              <h3 className="font-bold">{activeTask.title}</h3>
              <p className="text-sm text-gray-600">{activeTask.description}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Form Modal */}
      {showTaskForm && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 p-4">
            <div className="my-auto w-full max-w-6xl rounded-[32px] border border-slate-200 bg-white shadow-2xl">
              <TaskForm
                task={editingTask}
                onSave={handleSaveTask}
                onAddComment={async (taskId, body) => {
                  const updatedTask = await addTaskComment(taskId, body);
                  setEditingTask(updatedTask);
                  return updatedTask;
                }}
                onDeleteComment={async (taskId, commentId) => {
                  const updatedTask = await deleteTaskComment(taskId, commentId);
                  setEditingTask(updatedTask);
                  return updatedTask;
                }}
                currentUserId={currentUser?._id}
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
                status={taskStatus}
                users={users}
                columns={columns}
              />
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Column sequence modal */}
      {showColumnManager && (
        <ModalPortal>
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Column sequence</h3>
                  <p className="mt-1 text-sm text-slate-600">Move statuses up/down to control the board flow.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowColumnManager(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2">
                {columnDraft.map((col, idx) => (
                  <div key={col} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{col}</div>
                      <div className="text-xs text-slate-500">Status {idx + 1}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={idx === 0}
                        onClick={() => {
                          setColumnDraft((prev) => {
                            const next = [...prev];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            return next;
                          });
                        }}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={idx === columnDraft.length - 1}
                        onClick={() => {
                          setColumnDraft((prev) => {
                            const next = [...prev];
                            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                            return next;
                          });
                        }}
                      >
                        Down
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowColumnManager(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const updated = await updateBoard(currentBoard._id, { columns: columnDraft });
                    setCurrentBoard(updated);
                    setShowColumnManager(false);
                  }}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Save sequence
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-xs rounded-xl bg-white p-6 shadow-2xl">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
