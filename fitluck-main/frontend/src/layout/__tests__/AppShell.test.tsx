import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from '../AppShell';
import { AuthProvider } from '../../auth/AuthContext';
import { ThemeProvider } from '../../theme/ThemeContext';

// Mock the useAuth hook
jest.mock('../../auth/useAuth', () => ({
  useAuth: () => ({
    logout: jest.fn(),
    user: { name: 'John Doe', email: 'john@example.com' },
  }),
}));

// Mock ThemeToggle to avoid ThemeProvider dependency
jest.mock('../../theme/ThemeToggle', () => ({
  ThemeToggle: () => <button aria-label="Theme toggle">Toggle</button>,
}));

describe('AppShell', () => {
  it('renders sidebar with navigation items', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if logo/brand is present (use getAllBy because sidebar text may appear multiple times)
    expect(screen.getAllByText('FITLUCK')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Train with intent')[0]).toBeInTheDocument();

    // Check navigation items (use getAllByText to handle duplicate page title in <h1>)
    expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Plan')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Workout')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Progress')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Analytics')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Exercises')[0]).toBeInTheDocument();

    // Check user info
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();

    // Check logout button
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    render(
      <MemoryRouter initialEntries={['/plan']}>
        <AuthProvider>
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // The Plan link should have active styling (find the nav link specifically)
    const planLinks = screen.getAllByText('Plan');
    const planNavLink = planLinks.map((el) => el.closest('a')).find(Boolean);
    expect(planNavLink).toHaveClass('bg-lime-400');
  });

  it('toggles mobile sidebar when menu button is clicked', () => {
    // Mock window.matchMedia for responsive behavior
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false, // Simulate mobile (lg: false)
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Menu button uses aria-label="Open navigation"
    const menuButton = screen.getByRole('button', { name: /open navigation/i });
    expect(menuButton).toBeInTheDocument();

    // Click to open mobile sidebar
    fireEvent.click(menuButton);

    // After click, close buttons should appear (overlay + X icon button)
    const closeButtons = screen.getAllByRole('button', { name: /close navigation/i });
    expect(closeButtons.length).toBeGreaterThan(0);
  });
});