import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../stores/AuthContext';
import Dashboard from '../Dashboard';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as Record<string, unknown>),
    useNavigate: () => mockNavigate
  };
});

// Mock AuthContext
const mockLogout = vi.fn();
let mockUser: { id: string; email: string; } | null = {
  id: '1',
  email: 'test@example.com'
};

vi.mock('../../stores/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock CarsPage component
vi.mock('../CarsPage', () => ({
  CarsPage: () => <div data-testid="cars-page">Cars Page Content</div>
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mockUser to default value
    mockUser = {
      id: '1',
      email: 'test@example.com'
    };
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders dashboard with user info', () => {
    renderDashboard();
    
    expect(screen.getByText('Artemis')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('handles logout', () => {
    renderDashboard();
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('displays user email correctly', () => {
    // Update mockUser before rendering
    mockUser = {
      id: '2',
      email: 'different@example.com'
    };

    renderDashboard();
    
    expect(screen.getByText('different@example.com')).toBeInTheDocument();
  });

  it('handles missing user data gracefully', () => {
    // Set mockUser to null before rendering
    mockUser = null;

    renderDashboard();
    
    // Should still render the basic structure
    expect(screen.getByText('Artemis')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    // Email should not be displayed
    expect(screen.queryByText(/test@example\.com/)).not.toBeInTheDocument();
  });

  it('renders the cars page by default', () => {
    renderDashboard();
    
    expect(screen.getByTestId('cars-page')).toBeInTheDocument();
  });
}); 