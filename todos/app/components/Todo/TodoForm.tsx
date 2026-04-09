'use client';

import { useState, useEffect } from 'react';
import { Todo, Priority } from '@/app/lib/types';
import { storage } from '@/app/lib/storage';
import { X, Calendar, Flag, Type, FileText } from 'lucide-react';

interface TodoFormProps {
  todo?: Todo | null;
  onClose: () => void;
  onSave: () => void;
}

export default function TodoForm({ todo, onClose, onSave }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
      setPriority(todo.priority);
      setDueDate(todo.dueDate.split('T')[0]);
    } else {
      // Default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [todo]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    if (new Date(dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const todoData = {
      title,
      description,
      priority,
      dueDate: new Date(dueDate).toISOString(),
      completed: todo?.completed || false,
    };

    if (todo) {
      storage.updateTodo(todo.id, todoData);
    } else {
      storage.addTodo(todoData);
    }

    onSave();
    onClose();
  };

  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'text-teal-300 bg-teal-400/10 border-teal-400/20' },
    { value: 'medium', label: 'Medium', color: 'text-amber-300 bg-amber-400/10 border-amber-400/20' },
    { value: 'high', label: 'High', color: 'text-rose-300 bg-rose-400/10 border-rose-400/20' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="app-shell w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(8,15,29,0.98)_100%)] max-h-[90vh]">
        {/* Header */}
        <div className="sticky top-0 z-10 rounded-t-[32px] border-b border-white/10 bg-slate-950/90 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow mb-2">Task Editor</div>
              <h2 className="text-2xl font-bold text-white">
                {todo ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="mt-1 text-slate-400">
                {todo ? 'Update your task details' : 'Add a new task to your dashboard'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
              <Type size={16} />
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`input-surface w-full rounded-2xl px-4 py-3 text-white ${errors.title ? 'border-rose-500' : ''} focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400`}
              placeholder="What needs to be done?"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-rose-300">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
              <FileText size={16} />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-surface w-full rounded-2xl px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Add details, notes, or instructions..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                <Flag size={16} />
                Priority
              </label>
              <div className="flex gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`flex-1 rounded-2xl border px-4 py-3 transition-all ${priority === option.value
                      ? `${option.color} border-current`
                      : 'panel-muted border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Flag size={14} />
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                <Calendar size={16} />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`input-surface w-full rounded-2xl px-4 py-3 text-white ${errors.dueDate ? 'border-rose-500' : ''} focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-rose-300">{errors.dueDate}</p>
              )}
              <p className="mt-2 text-sm text-slate-400">
                {dueDate && new Date(dueDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="panel rounded-[24px] p-4">
            <h3 className="mb-3 text-sm font-medium text-slate-200">Preview</h3>
            <div className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded-full border-2 ${todo?.completed ? 'border-teal-300' : 'border-slate-500'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${todo?.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                    {title || 'Task Title'}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${priorityOptions.find(o => o.value === priority)?.color}`}>
                    {priority}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {description || 'Task description will appear here'}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span>Due: {dueDate ? new Date(dueDate).toLocaleDateString() : 'Select date'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="input-surface flex-1 rounded-2xl px-6 py-3 text-white transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              {todo ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
