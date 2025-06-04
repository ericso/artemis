import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, RouteObject } from 'react-router-dom';
import { AuthProvider } from '../../stores/AuthContext';
import { router } from '../index';

// Mock components
const MockHome = () => <div>Home Page</div>;
const MockLogin = () => <div>Login Page</div>;
const MockDashboard = () => <div>Dashboard Page</div>;
const MockRegister = () => <div>Register Page</div>;

// Mock the page components
vi.mock('../../pages/Home', () => ({
  default: () => <MockHome />
}));

vi.mock('../../pages/Login', () => ({
  default: () => <MockLogin />
}));

vi.mock('../../pages/Dashboard', () => ({
  default: () => <MockDashboard />
}));

vi.mock('../../pages/Register', () => ({
  default: () => <MockRegister />
}));

describe('Router Configuration', () => {
  const renderWithRouter = (initialEntry: string) => {
    return render(
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
  };

  describe('Public Routes', () => {
    it('renders home page for unauthenticated users', () => {
      renderWithRouter('/');
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('renders home page for authenticated users', () => {
      localStorage.setItem('token', 'fake-token');
      renderWithRouter('/');
      expect(screen.getByText('Home Page')).toBeInTheDocument();
      localStorage.clear();
    });
  });

  describe('Guest Routes', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('renders login page for unauthenticated users', () => {
      renderWithRouter('/login');
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects to dashboard when accessing login while authenticated', () => {
      localStorage.setItem('token', 'fake-token');
      renderWithRouter('/login');
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('renders register page for unauthenticated users', () => {
      renderWithRouter('/register');
      expect(screen.getByText('Register Page')).toBeInTheDocument();
    });

    it('redirects to dashboard when accessing register while authenticated', () => {
      localStorage.setItem('token', 'fake-token');
      renderWithRouter('/register');
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('redirects to login when accessing dashboard without authentication', () => {
      renderWithRouter('/dashboard');
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('renders dashboard for authenticated users', () => {
      localStorage.setItem('token', 'fake-token');
      renderWithRouter('/dashboard');
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
  });
}); 