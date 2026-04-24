import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

jest.mock('../services/api', () => ({
  TOKEN_KEY: 'kanban_auth_token',
  authService: {
    me: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  },
  boardService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  taskService: {
    getByBoardId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    reorder: jest.fn(),
    addComment: jest.fn(),
    deleteComment: jest.fn(),
  },
  userService: {
    getAll: jest.fn(),
  },
}));

describe('App', () => {
  test('shows the sign in screen when no session is present', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/jira-style workspace access with secure authentication/i)).toBeInTheDocument();
  });
});
