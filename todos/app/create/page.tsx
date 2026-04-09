'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { storage } from '@/app/lib/storage';
import { Priority } from '@/app/lib/types';

export default function CreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const todoData = {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      completed: false,
    };

    storage.addTodo(todoData);
    setIsSubmitting(false);
    setSuccess(true);

    // Redirect after success
    setTimeout(() => {
      router.push('/todos');
    }, 1500);
  };

  const priorityOptions: { value: Priority; label: string; color: string; icon: string }[] = [
    { value: 'low', label: 'Low Priority', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400', icon: '🟢' },
    { value: 'medium', label: 'Medium Priority', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400', icon: '🟡' },
    { value: 'high', label: 'High Priority', color: 'border-rose-500/30 bg-rose-500/10 text-rose-400', icon: '🔴' },
  ];

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="panel rounded-[32px] py-14 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-r from-teal-500 to-cyan-500">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Task Created Successfully!</h1>
          <p className="mb-8 text-slate-300">Your new task has been added to the dashboard.</p>
          <div className="animate-pulse text-sm text-teal-300">
            Redirecting to tasks...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="panel mb-8 rounded-[32px] p-6 lg:p-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="eyebrow mb-3">New Work Item</div>
        <h1 className="section-title text-4xl font-bold text-white">Create New Task</h1>
        <p className="mt-2 text-slate-300">Fill in the details below to create a new task</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title & Description */}
        <div className="panel rounded-[32px] p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Task Details</h2>
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="input-surface w-full rounded-2xl px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="What needs to be done?"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="input-surface w-full rounded-2xl px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Add details, notes, or instructions..."
              />
            </div>
          </div>
        </div>

        {/* Priority & Due Date */}
        <div className="panel rounded-[32px] p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-200">
                Priority Level
              </label>
              <div className="space-y-3">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`w-full rounded-2xl border px-4 py-3 transition-all ${priority === option.value
                      ? `${option.color} border-current`
                      : 'panel-muted border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-200">
                Due Date *
              </label>
              <div className="space-y-4">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="input-surface w-full rounded-2xl px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <div className="text-sm text-slate-400">
                  {dueDate ? (
                    <div>
                      Due on <span className="text-white">{new Date(dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  ) : (
                    'Select a due date for your task'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="panel rounded-[32px] p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Preview</h2>
          <div className="panel-muted rounded-[24px] p-5">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-6 w-6 rounded-full border-2 border-slate-500" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-lg font-medium ${title ? 'text-white' : 'text-slate-500'}`}>
                    {title || 'Task Title'}
                  </h3>
                  <span className={`rounded-full border px-3 py-1 text-sm ${priorityOptions.find(o => o.value === priority)?.color}`}>
                    {priority}
                  </span>
                </div>
                <p className="mb-4 text-slate-300">
                  {description || 'Task description will appear here'}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Due: {dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}</span>
                  <span>Status: Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="input-surface flex-1 rounded-2xl px-6 py-4 text-white transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title || !dueDate}
            className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 px-6 py-4 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
