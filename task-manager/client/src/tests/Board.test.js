import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Board from '../components/Board';

const mockUseKanban = jest.fn();
const mockUseAuth = jest.fn();
const mockHandleDragEnd = jest.fn();

jest.mock('../context/KanbanContext', () => ({
  useKanban: () => mockUseKanban(),
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../hooks/useDragAndDrop', () => ({
  useDragAndDrop: () => ({
    handleDragEnd: mockHandleDragEnd,
  }),
}));

jest.mock('../components/Column', () => (props) => (
  <div data-testid={`column-${props.status}`}>
    <span>{props.title}</span>
    <button type="button" onClick={() => props.onAddTask(props.status)}>
      Add task to {props.status}
    </button>
  </div>
));

jest.mock('../components/TaskForm', () => (props) => (
  <div>
    <p>Task Form Mock</p>
    <button type="button" onClick={props.onCancel}>
      Close Task Form
    </button>
  </div>
));

jest.mock('../components/BoardForm', () => (props) => (
  <div>
    <p>Board Form Mock</p>
    <button type="button" onClick={props.onCancel}>
      Close Board Form
    </button>
  </div>
));

const baseKanbanValue = {
  currentBoard: null,
  tasks: [],
  getTasksByStatus: jest.fn(() => []),
  createTask: jest.fn(),
  fetchUsers: jest.fn(() => Promise.resolve([])),
  users: [],
  addTaskComment: jest.fn(),
  deleteTaskComment: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  updateBoard: jest.fn(),
  deleteBoard: jest.fn(),
  loading: false,
  error: null,
};

describe('Board', () => {
  beforeEach(() => {
    mockHandleDragEnd.mockReset();
    mockUseAuth.mockReturnValue({
      user: { _id: 'user-1', name: 'Alice' },
    });
  });

  test('shows the empty state when no board is selected', () => {
    const fetchUsers = jest.fn(() => Promise.resolve([]));

    mockUseKanban.mockReturnValue({
      ...baseKanbanValue,
      currentBoard: null,
      fetchUsers,
    });

    render(<Board />);

    expect(screen.getByText(/no board selected/i)).toBeInTheDocument();
    expect(screen.getByText(/please select or create a board to get started/i)).toBeInTheDocument();
  });

  test('renders the selected board details and fetches users on mount', async () => {
    const fetchUsers = jest.fn(() => Promise.resolve([]));
    const getTasksByStatus = jest.fn((status) => {
      if (status === 'Todo') {
        return [{ _id: 'task-1', title: 'Draft UI' }];
      }
      return [];
    });

    mockUseKanban.mockReturnValue({
      ...baseKanbanValue,
      currentBoard: {
        _id: 'board-1',
        name: 'Product Roadmap',
        description: 'Track launch work',
        columns: ['Todo', 'In Progress', 'Done'],
      },
      tasks: [{ _id: 'task-1', status: 'Todo', position: 0 }],
      fetchUsers,
      getTasksByStatus,
    });

    render(<Board />);

    expect(screen.getByText(/product roadmap/i)).toBeInTheDocument();
    expect(screen.getByText(/track launch work/i)).toBeInTheDocument();
    expect(screen.getByText(/total tasks: 1/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalled();
    });
  });

  test('opens board and task modals from dashboard actions', () => {
    const fetchUsers = jest.fn(() => Promise.resolve([]));

    mockUseKanban.mockReturnValue({
      ...baseKanbanValue,
      currentBoard: {
        _id: 'board-1',
        name: 'Engineering',
        description: 'Delivery board',
        columns: ['Todo', 'In Progress', 'Done'],
      },
      tasks: [],
      fetchUsers,
      getTasksByStatus: jest.fn(() => []),
    });

    render(<Board />);

    fireEvent.click(screen.getByRole('button', { name: /edit board/i }));
    expect(screen.getByText(/board form mock/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add task to todo/i }));
    expect(screen.getByText(/task form mock/i)).toBeInTheDocument();
  });
});
