'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  Plus,
  Filter
} from 'lucide-react';
import { storage } from './lib/storage';
import { Todo, TodoStats } from './lib/types';
import TodoList from './components/Todo/TodoList';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    highPriority: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const loadTodos = () => {
      const todosData = storage.getTodos();
      setTodos(todosData);
      
      const now = new Date();
      const statsData: TodoStats = {
        total: todosData.length,
        completed: todosData.filter(t => t.completed).length,
        pending: todosData.filter(t => !t.completed).length,
        overdue: todosData.filter(t => !t.completed && new Date(t.dueDate) < now).length,
        highPriority: todosData.filter(t => t.priority === 'high').length,
      };
      setStats(statsData);
    };

    loadTodos();
    // Listen for storage changes
    window.addEventListener('storage', loadTodos);
    return () => window.removeEventListener('storage', loadTodos);
  }, []);

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: CheckCircle,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-500/10',
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Due This Week',
      value: 3, // Mock
      icon: Calendar,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-500/10',
    },
  ];

  const recentTodos = todos.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="panel rounded-[32px] p-6 lg:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow mb-3">Control Center</div>
            <h1 className="section-title text-4xl font-bold text-white lg:text-5xl">Dashboard</h1>
            <p className="mt-3 max-w-xl text-base text-slate-300 lg:text-lg">
              Keep the team aligned, stay ahead of deadlines, and manage every task from a cleaner SaaS-style workspace.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
            <div className="metric-card rounded-[24px] p-4">
              <div className="text-sm text-slate-400">Completion</div>
              <div className="mt-2 text-3xl font-bold text-white">
                {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
            </div>
            <div className="metric-card rounded-[24px] p-4">
              <div className="text-sm text-slate-400">Open Tasks</div>
              <div className="mt-2 text-3xl font-bold text-amber-300">{stats.pending}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push('/todos')}
            className="input-surface flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-white transition-colors hover:bg-white/10"
          >
            <Filter size={20} />
            View All
          </button>
          <button
            onClick={() => router.push('/create')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-sky-500 px-5 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Performance Snapshot</h2>
          <p className="mt-1 text-slate-400">A quick read on volume, urgency, and delivery status.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`metric-card rounded-[28px] p-5 ${card.bgColor} soft-ring`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">{card.title}</p>
                  <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${card.color} rounded-full`}
                    style={{ width: `${Math.min((card.value / (stats.total || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="panel rounded-[32px] p-6 soft-ring">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="eyebrow mb-2">Latest</div>
                <h2 className="text-xl font-semibold text-white">Recent Tasks</h2>
              </div>
              <button
                onClick={() => router.push('/todos')}
                className="text-sm text-cyan-200 hover:text-cyan-100"
              >
                View all →
              </button>
            </div>
            <TodoList todos={recentTodos} compact />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="panel rounded-[32px] p-6 soft-ring">
            <div className="eyebrow mb-2">Action Hub</div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/create')}
                className="panel-muted w-full rounded-2xl p-4 transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15">
                    <Plus size={20} className="text-cyan-200" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Add New Task</p>
                    <p className="text-sm text-slate-400">Create a todo</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => storage.saveTodos([])}
                className="panel-muted w-full rounded-2xl p-4 transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/15">
                    <AlertCircle size={20} className="text-rose-300" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Clear All</p>
                    <p className="text-sm text-slate-400">Remove all tasks</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  const updated = todos.map(t => ({ ...t, completed: true }));
                  storage.saveTodos(updated);
                  setTodos(updated);
                }}
                className="panel-muted w-full rounded-2xl p-4 transition-colors hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/15">
                    <CheckCircle size={20} className="text-teal-200" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Complete All</p>
                    <p className="text-sm text-slate-400">Mark all as done</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="panel rounded-[32px] p-6 soft-ring">
            <div className="eyebrow mb-2">Progress</div>
            <h3 className="mb-4 text-lg font-semibold text-white">Delivery Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Completion</span>
                  <span className="text-white">
                    {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                    style={{ width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">On Time</span>
                  <span className="text-white">
                    {stats.pending ? Math.round(((stats.pending - stats.overdue) / stats.pending) * 100) : 100}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                    style={{ width: `${stats.pending ? ((stats.pending - stats.overdue) / stats.pending) * 100 : 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
