import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

const Column = ({ 
  status, 
  tasks, 
  onAddTask, 
  onEditTask, 
  onDeleteTask,
  title,
  color 
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: {
      type: 'column',
      status
    }
  });

  const getStatusColor = () => {
    switch (status) {
      case 'Todo': return 'bg-blue-50 border-blue-200 dark:bg-slate-900/60 dark:border-slate-800';
      case 'In Progress': return 'bg-yellow-50 border-yellow-200 dark:bg-slate-900/60 dark:border-slate-800';
      case 'Done': return 'bg-green-50 border-green-200 dark:bg-slate-900/60 dark:border-slate-800';
      default: return 'bg-gray-50 border-gray-200 dark:bg-slate-900/60 dark:border-slate-800';
    }
  };

  const getHeaderColor = () => {
    switch (status) {
      case 'Todo': return 'bg-blue-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Done': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-full sm:w-96 rounded-xl border ${getStatusColor()} ${isOver ? 'ring-2 ring-primary-400' : ''} shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <div className={`rounded-t-xl p-4 ${getHeaderColor()} text-white`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{title || status}</h2>
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
            {tasks.length} tasks
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <button
          onClick={() => onAddTask(status)}
          className="mb-4 w-full rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-slate-600 transition-colors duration-200 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-900/40 dark:hover:text-slate-100"
        >
          + Add Task
        </button>
        
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <TaskCard
              key={task._id}
              task={task}
              index={index}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p>No tasks in this column</p>
              <p className="text-sm mt-1">Drag tasks here or click "Add Task"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Column;
