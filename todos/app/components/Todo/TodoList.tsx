'use client';

import { useState } from 'react';
import { Todo, FilterStatus, SortField, SortDirection } from '@/app/lib/types';
import TodoItem from './TodoItem';
import { Search, Filter, SortAsc, ChevronDown } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  compact?: boolean;
}

export default function TodoList({ todos, compact = false }: TodoListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(search.toLowerCase()) ||
                         todo.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'completed' ? todo.completed :
      !todo.completed;
    return matchesSearch && matchesFilter;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (sortField) {
      case 'dueDate':
        aVal = new Date(a.dueDate).getTime();
        bVal = new Date(b.dueDate).getTime();
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aVal = priorityOrder[a.priority];
        bVal = priorityOrder[b.priority];
        break;
      case 'createdAt':
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
        break;
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const priorityCounts = {
    high: todos.filter(t => t.priority === 'high').length,
    medium: todos.filter(t => t.priority === 'medium').length,
    low: todos.filter(t => t.priority === 'low').length,
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {sortedTodos.map(todo => (
          <TodoItem key={todo.id} todo={todo} compact />
        ))}
        {sortedTodos.length === 0 && (
          <div className="panel rounded-3xl py-10 text-center text-slate-400">
            No tasks found
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="panel rounded-[28px] p-5 soft-ring">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="input-surface w-full rounded-2xl py-3 pl-12 pr-4 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Filter & Sort */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="input-surface flex items-center gap-2 rounded-2xl px-4 py-3 text-white transition-colors hover:bg-white/10"
            >
              <Filter size={20} />
              Filter
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="input-surface rounded-2xl px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Created</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="input-surface rounded-2xl px-4 py-3 text-white transition-colors hover:bg-white/10"
            >
              <SortAsc size={20} className={sortDirection === 'desc' ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-5 border-t border-white/10 pt-5">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Status:</span>
                {(['all', 'pending', 'completed'] as FilterStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`rounded-xl px-3 py-1.5 capitalize ${filter === status
                      ? 'bg-white text-slate-950'
                      : 'panel-muted text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Priority:</span>
                {(['high', 'medium', 'low'] as const).map(priority => (
                  <button
                    key={priority}
                    onClick={() => {
                      // Toggle priority filter (simplified)
                    }}
                    className={`rounded-xl px-3 py-1.5 capitalize ${priorityCounts[priority] > 0
                      ? 'panel-muted text-white hover:bg-white/10'
                      : 'panel-muted text-slate-500'
                    }`}
                  >
                    {priority} ({priorityCounts[priority]})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card rounded-[24px] p-5">
          <div className="text-sm text-slate-300">Showing</div>
          <div className="text-2xl font-bold text-white">{sortedTodos.length} tasks</div>
        </div>
        <div className="metric-card rounded-[24px] p-5">
          <div className="text-sm text-slate-300">Completed</div>
          <div className="text-2xl font-bold text-teal-300">
            {todos.filter(t => t.completed).length}
          </div>
        </div>
        <div className="metric-card rounded-[24px] p-5">
          <div className="text-sm text-slate-300">Pending</div>
          <div className="text-2xl font-bold text-amber-300">
            {todos.filter(t => !t.completed).length}
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {sortedTodos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
        {sortedTodos.length === 0 && (
          <div className="panel rounded-[32px] py-14 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5">
              <Search size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
            <p className="text-slate-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
