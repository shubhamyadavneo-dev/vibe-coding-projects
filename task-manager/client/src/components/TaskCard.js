import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = ({ task, index, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `task-${task._id}`,
    data: {
      type: 'task',
      task,
      index
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab'
  };
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'from-rose-50 via-white to-rose-100 border-rose-200 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:border-slate-800';
      case 'medium': return 'from-amber-50 via-white to-yellow-100 border-amber-200 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:border-slate-800';
      case 'low': return 'from-emerald-50 via-white to-green-100 border-emerald-200 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:border-slate-800';
      default: return 'from-slate-50 via-white to-slate-100 border-slate-200 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:border-slate-800';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Medium';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      id={`task-${task._id}`}
      data-status={task.status}
      data-index={index}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`task-card mb-3 cursor-grab rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg active:cursor-grabbing ${getPriorityColor(task.priority)}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
              Ticket
            </span>
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white/90 dark:bg-slate-700">
              {task.status}
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 sm:text-lg">{task.title}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${task.priority === 'high' ? 'bg-rose-500 text-white' : task.priority === 'medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {getPriorityText(task.priority)}
        </span>
      </div>
      
      <p className="mb-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-300 sm:text-base">{task.description || 'No description'}</p>

      <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
        <div className="rounded-xl border border-white/70 bg-white/70 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
          <p className="mb-1 font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-400">Assignee</p>
          <p className="line-clamp-2 text-sm font-medium text-slate-800 dark:text-slate-100">
            {task.assignee ? task.assignee.name : 'Unassigned'}
          </p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/70 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
          <p className="mb-1 font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-400">Comments</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{task.comments?.length || 0}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span className="text-xs">
          Updated {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isHovered
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200'
            }`}
          >
            Open
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
