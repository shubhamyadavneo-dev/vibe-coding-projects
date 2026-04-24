import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AuthForm from '../components/AuthForm';

const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
  }),
}));

describe('AuthForm', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockRegister.mockReset();
  });

  test('submits sign in credentials in login mode', async () => {
    mockLogin.mockResolvedValue({ _id: 'user-1' });

    render(<AuthForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('alice@example.com', 'secret123');
    });
  });

  test('switches to register mode and submits full registration payload', async () => {
    mockRegister.mockResolvedValue({ _id: 'user-2' });

    render(<AuthForm />);

    fireEvent.click(screen.getByRole('button', { name: /new here\? create an account/i }));

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Bob Builder' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'bob@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('Bob Builder', 'bob@example.com', 'secret123');
    });
  });

  test('shows an authentication error when the request fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    render(<AuthForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
