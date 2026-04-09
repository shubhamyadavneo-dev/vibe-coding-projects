'use client';

import { useState, useEffect } from 'react';
import { Plus, Download, Upload, Trash2 } from 'lucide-react';
import { storage } from '@/app/lib/storage';
import { Todo } from '@/app/lib/types';
import TodoList from '@/app/components/Todo/TodoList';
import TodoForm from '@/app/components/Todo/TodoForm';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  useEffect(() => {
    const loadTodos = () => {
      setTodos(storage.getTodos());
    };
    loadTodos();
    window.addEventListener('storage', loadTodos);
    return () => window.removeEventListener('storage', loadTodos);
  }, []);

  const handleExport = () => {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTodos = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedTodos)) {
          storage.saveTodos(importedTodos);
          setTodos(importedTodos);
          window.dispatchEvent(new Event('storage'));
          alert('Todos imported successfully!');
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
      storage.saveTodos([]);
      setTodos([]);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleSave = () => {
    setTodos(storage.getTodos());
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="panel rounded-[32px] p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow mb-3">Task Pipeline</div>
            <h1 className="section-title text-4xl font-bold text-white">Task Manager</h1>
            <p className="mt-3 text-slate-300">
              Manage work items, keep everything searchable, and maintain a clean operating rhythm across the board.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="input-surface flex items-center gap-2 rounded-2xl px-4 py-3 text-white transition-colors hover:bg-white/10"
            >
              <Download size={20} />
              Export
            </button>
            <label className="input-surface flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-white transition-colors hover:bg-white/10">
              <Upload size={20} />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-rose-200 transition-colors hover:bg-rose-400/15"
            >
              <Trash2 size={20} />
              Clear All
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              <Plus size={20} />
              New Task
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Operational Snapshot</h2>
          <p className="mt-1 text-slate-400">See what needs attention first and where the workload sits.</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card rounded-[24px] p-5">
          <div className="text-sm text-slate-300">Total Tasks</div>
          <div className="text-2xl font-bold text-white">{todos.length}</div>
        </div>
        <div className="metric-card rounded-[24px] p-5">
          <div className="text-sm text-slate-300">Completed</div>
          <div className="text-2xl font-bold text-teal-300">
            {todos.filter(t => t.completed).length}
          </div>
        </div>
        <div className="metric-card rounded-[24px] p-5">
          <div className="text-sm text-slate-300">High Priority</div>
          <div className="text-2xl font-bold text-rose-300">
            {todos.filter(t => t.priority === 'high').length}
          </div>
        </div>
        <div className="metric-card rounded-[24px] p-5">
          <div className="text-sm text-slate-300">Overdue</div>
          <div className="text-2xl font-bold text-amber-300">
            {todos.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length}
          </div>
        </div>
      </div>

      {/* Todo List */}
      <TodoList todos={todos} />

      {/* Create/Edit Form Modal */}
      {showForm && (
        <TodoForm
          todo={editingTodo}
          onClose={() => {
            setShowForm(false);
            setEditingTodo(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
