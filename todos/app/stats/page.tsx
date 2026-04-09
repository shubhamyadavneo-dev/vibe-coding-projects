'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Clock,
  AlertCircle,
  PieChart
} from 'lucide-react';
import { storage } from '@/app/lib/storage';
import { Todo, TodoStats } from '@/app/lib/types';

export default function StatsPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    highPriority: 0,
  });

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
    window.addEventListener('storage', loadTodos);
    return () => window.removeEventListener('storage', loadTodos);
  }, []);

  const priorityDistribution = {
    high: todos.filter(t => t.priority === 'high').length,
    medium: todos.filter(t => t.priority === 'medium').length,
    low: todos.filter(t => t.priority === 'low').length,
  };

  const completionRate = stats.total ? (stats.completed / stats.total) * 100 : 0;
  const onTimeRate = stats.pending ? ((stats.pending - stats.overdue) / stats.pending) * 100 : 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="panel rounded-[32px] p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="eyebrow mb-3">Insight Center</div>
            <h1 className="section-title text-4xl font-bold text-white">Analytics Dashboard</h1>
            <p className="mt-3 text-slate-300">Track momentum, task quality, and priority balance through a cleaner reporting surface.</p>
          </div>
          <div className="panel-muted inline-flex items-center gap-2 rounded-2xl px-4 py-3">
            <BarChart3 size={20} className="text-cyan-300" />
            <span className="font-medium text-white">Real-time Stats</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Key Metrics</h2>
          <p className="mt-1 text-slate-400">A compact view of throughput, urgency, and task mix.</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card rounded-[28px] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15">
              <CheckCircle size={24} className="text-cyan-400" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.completed}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Completed Tasks</h3>
          <p className="text-sm text-slate-400">Tasks marked as done</p>
        </div>

        <div className="metric-card rounded-[28px] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15">
              <Clock size={24} className="text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.pending}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Pending Tasks</h3>
          <p className="text-sm text-slate-400">Awaiting completion</p>
        </div>

        <div className="metric-card rounded-[28px] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/15">
              <AlertCircle size={24} className="text-rose-400" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.overdue}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Overdue Tasks</h3>
          <p className="text-sm text-slate-400">Past due date</p>
        </div>

        <div className="metric-card rounded-[28px] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/15">
              <TrendingUp size={24} className="text-sky-300" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.highPriority}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">High Priority</h3>
          <p className="text-sm text-slate-400">Urgent tasks</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Completion Rate */}
        <div className="panel rounded-[32px] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/15">
              <PieChart size={20} className="text-teal-300" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Completion Rate</h3>
              <p className="text-sm text-slate-400">Overall task completion</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Progress</span>
              <span className="text-2xl font-bold text-teal-300">{completionRate.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="panel-muted rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats.completed}</div>
                <div className="text-sm text-slate-400">Completed</div>
              </div>
              <div className="panel-muted rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats.pending}</div>
                <div className="text-sm text-slate-400">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="panel rounded-[32px] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/15">
              <BarChart3 size={20} className="text-sky-300" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Priority Distribution</h3>
              <p className="text-sm text-slate-400">Breakdown by priority level</p>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(priorityDistribution).map(([level, count]) => {
              const percentage = stats.total ? (count / stats.total) * 100 : 0;
              const colors = {
                high: 'from-rose-500 to-pink-500',
                medium: 'from-amber-500 to-orange-500',
                low: 'from-emerald-500 to-green-500',
              };
              const labels = {
                high: 'High Priority',
                medium: 'Medium Priority',
                low: 'Low Priority',
              };
              return (
                <div key={level} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{labels[level as keyof typeof labels]}</span>
                    <span className="text-white font-medium">{count} tasks ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${colors[level as keyof typeof colors]} rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="panel rounded-[32px] p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {todos.slice(0, 5).map((todo) => (
            <div key={todo.id} className="panel-muted flex items-center justify-between rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full ${todo.completed ? 'bg-teal-300' : 'bg-amber-300'}`} />
                <div>
                  <h4 className="font-medium text-white">{todo.title}</h4>
                  <p className="text-sm text-slate-400">
                    Due {new Date(todo.dueDate).toLocaleDateString()} • {todo.priority} priority
                  </p>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                {todo.completed ? 'Completed' : 'Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
