import { Todo, User } from './types';

const TODOS_KEY = 'todos_dashboard_todos';
const USER_KEY = 'todos_dashboard_user';

// Initialize with sample data if empty
const initialTodos: Todo[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Write and submit the project proposal document',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Team meeting',
    description: 'Weekly sync with development team',
    priority: 'medium',
    dueDate: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
    completed: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
  },
  {
    id: '3',
    title: 'Update documentation',
    description: 'Add new API endpoints to documentation',
    priority: 'low',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // yesterday (overdue)
    completed: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
];

export const storage = {
  // Todos
  getTodos(): Todo[] {
    if (typeof window === 'undefined') return initialTodos;
    const data = localStorage.getItem(TODOS_KEY);
    if (!data) {
      localStorage.setItem(TODOS_KEY, JSON.stringify(initialTodos));
      return initialTodos;
    }
    return JSON.parse(data) as Todo[];
  },

  saveTodos(todos: Todo[]): void {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  },

  addTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Todo {
    const todos = this.getTodos();
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedTodos = [...todos, newTodo];
    this.saveTodos(updatedTodos);
    return newTodo;
  },

  updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>): Todo | null {
    const todos = this.getTodos();
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) return null;
    const updatedTodo = { ...todos[index], ...updates };
    const updatedTodos = [...todos];
    updatedTodos[index] = updatedTodo;
    this.saveTodos(updatedTodos);
    return updatedTodo;
  },

  deleteTodo(id: string): boolean {
    const todos = this.getTodos();
    const filtered = todos.filter(t => t.id !== id);
    if (filtered.length === todos.length) return false;
    this.saveTodos(filtered);
    return true;
  },

  toggleTodo(id: string): Todo | null {
    const todos = this.getTodos();
    const todo = todos.find(t => t.id === id);
    if (!todo) return null;
    return this.updateTodo(id, { completed: !todo.completed });
  },

  // User
  getUser(): User {
    if (typeof window === 'undefined') return { isLoggedIn: false };
    const data = localStorage.getItem(USER_KEY);
    if (!data) {
      const user: User = { isLoggedIn: false };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    }
    return JSON.parse(data) as User;
  },

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  login(username: string): void {
    this.setUser({ isLoggedIn: true, username });
  },

  logout(): void {
    this.setUser({ isLoggedIn: false });
  },
};