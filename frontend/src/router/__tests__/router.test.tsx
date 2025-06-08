import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, RouteObject } from 'react-router-dom';
import { AuthProvider } from '../../stores/AuthContext';
import { router } from '../index';

// Mock components
const MockLogin = () => <div>Login Page</div>;
const MockDashboard = () => <div>Dashboard Page</div>;
const MockRegister = () => <div>Register Page</div>;

// Mock the page components
vi.mock('../../pages/Login', () => ({
  default: () => <MockLogin />
}));

vi.mock('../../pages/Dashboard', () => ({
  default: () => <MockDashboard />
}));

vi.mock('../../pages/Register', () => ({
  default: () => <MockRegister />
}));

// Mock CarsPage component since it's used in Dashboard
vi.mock('../../pages/CarsPage', () => ({
  CarsPage: () => <div data-testid="cars-page">Cars Page Content</div>
}));

// Mock AuthContext
let mockToken: string | null = null;
vi.mock('../../stores/AuthContext', () => ({
  useAuth: () => ({
    token: mockToken,
    logout: vi.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('Router Configuration', () => {
  const renderWithRouter = async (initialEntry: string) => {
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <AuthProvider>
          <Routes>
            {(router.routes as RouteObject[]).map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    // Wait for any redirects to complete
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  };

  describe('Protected Routes', () => {
    beforeEach(() => {
      mockToken = null;
    });

    it('redirects to login when accessing root without authentication', async () => {
      await renderWithRouter('/');
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('renders dashboard for authenticated users at root', async () => {
      mockToken = 'fake-token';
      await renderWithRouter('/');
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('redirects to login when accessing dashboard without authentication', async () => {
      await renderWithRouter('/');
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('renders dashboard for authenticated users', async () => {
      mockToken = 'fake-token';
      await renderWithRouter('/');
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
  });

  describe('Guest Routes', () => {
    beforeEach(() => {
      mockToken = null;
    });

    it('renders login page for unauthenticated users', async () => {
      await renderWithRouter('/login');
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects to dashboard when accessing login while authenticated', async () => {
      mockToken = 'fake-token';
      await renderWithRouter('/login');
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('renders register page for unauthenticated users', async () => {
      await renderWithRouter('/register');
      expect(screen.getByText('Register Page')).toBeInTheDocument();
    });

    it('redirects to dashboard when accessing register while authenticated', async () => {
      mockToken = 'fake-token';
      await renderWithRouter('/register');
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
  });
}); 