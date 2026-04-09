export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // ISO string
  completed: boolean;
  createdAt: string; // ISO string
}

export interface User {
  isLoggedIn: boolean;
  username?: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  highPriority: number;
}

export type FilterStatus = 'all' | 'completed' | 'pending';
export type SortField = 'dueDate' | 'priority' | 'createdAt' | 'title';
export type SortDirection = 'asc' | 'desc';