'use client';

import { Todo } from '@/app/lib/types';
import { 
  CheckCircle, 
  Circle, 
  Flag, 
  Calendar, 
  Edit2, 
  Trash2,
  MoreVertical,
  Clock,
  Check
} from 'lucide-react';
import { storage } from '@/app/lib/storage';
import { useState } from 'react';

interface TodoItemProps {
  todo: Todo;
  compact?: boolean;
}

export default function TodoItem({ todo, compact = false }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const priorityColors = {
    high: 'text-rose-300 bg-rose-400/10 border-rose-400/20',
    medium: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
    low: 'text-teal-300 bg-teal-400/10 border-teal-400/20',
  };

  const priorityIcons = {
    high: <Flag size={14} className="fill-rose-400 text-rose-400" />,
    medium: <Flag size={14} className="fill-amber-400 text-amber-400" />,
    low: <Flag size={14} className="fill-teal-400 text-teal-400" />,
  };

  const handleToggle = () => {
    storage.toggleTodo(todo.id);
    window.dispatchEvent(new Event('storage'));
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      storage.deleteTodo(todo.id);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `in ${diffDays} days`;
  };

  const isOverdue = !todo.completed && new Date(todo.dueDate) < new Date();

  if (compact) {
    return (
      <div className="panel flex items-center gap-3 rounded-[24px] p-4 transition-colors hover:bg-white/[0.06]">
        <button
          onClick={handleToggle}
          className="flex-shrink-0"
        >
          {todo.completed ? (
            <CheckCircle size={20} className="text-teal-300" />
          ) : (
            <Circle size={20} className="text-slate-500 hover:text-slate-300" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`truncate ${todo.completed ? 'line-through text-slate-500' : 'text-white'}`}>
              {todo.title}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-xs ${priorityColors[todo.priority]}`}>
              {todo.priority}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(todo.dueDate)}
            </span>
            {isOverdue && !todo.completed && (
              <span className="flex items-center gap-1 text-rose-300">
                <Clock size={12} />
                Overdue
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel rounded-[28px] overflow-hidden soft-ring">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={handleToggle}
            className="flex-shrink-0 mt-1"
          >
            {todo.completed ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500">
                <Check size={14} className="text-white" />
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-slate-500 hover:border-slate-300" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className={`text-lg font-semibold ${todo.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                  {todo.title}
                </h3>
                <p className="mt-1 text-slate-300">{todo.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${priorityColors[todo.priority]}`}>
                  {priorityIcons[todo.priority]}
                  {todo.priority}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 ${isOverdue && !todo.completed ? 'bg-rose-400/10 text-rose-300' : 'panel-muted text-slate-300'}`}>
                <Calendar size={14} />
                <span className="text-sm">
                  Due {formatDate(todo.dueDate)}
                  {isOverdue && !todo.completed && ' • Overdue'}
                </span>
              </div>
              <div className="panel-muted flex items-center gap-2 rounded-xl px-3 py-1.5 text-slate-300">
                <Clock size={14} />
                <span className="text-sm">
                  Created {formatDate(todo.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Edit"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={handleDelete}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-rose-400/10 hover:text-rose-300"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-slate-300">Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className={todo.completed ? 'text-teal-300' : 'text-amber-300'}>
                      {todo.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Priority</span>
                    <span className="capitalize text-white">
                      {todo.priority}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Due Date</span>
                    <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-slate-300">Actions</h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleToggle}
                    className="panel-muted flex-1 rounded-xl px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
                  >
                    {todo.completed ? 'Mark as Pending' : 'Mark as Complete'}
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200 transition-colors hover:bg-cyan-400/15"
                  >
                    Edit Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
