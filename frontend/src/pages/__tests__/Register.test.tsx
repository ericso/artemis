import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../stores/AuthContext';
import Register from '../Register';

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
const mockRegister = vi.fn();
let mockLoading = false;
let mockError: string | null = null;

vi.mock('../../stores/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    loading: mockLoading,
    error: mockError
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockError = null;
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders registration form', () => {
    renderRegister();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register|sign up|create account/i })).toBeInTheDocument();
  });

  it('validates matching passwords', async () => {
    renderRegister();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register|sign up|create account/i });

    // Fill form with mismatched passwords
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    
    fireEvent.click(submitButton);

    // Check for validation error
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    renderRegister();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register|sign up|create account/i });

    // Fill form with short password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    
    fireEvent.click(submitButton);

    // Check for validation error
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    mockRegister.mockResolvedValueOnce(true);
    renderRegister();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register|sign up|create account/i });

    // Fill form with valid data
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles registration failure', async () => {
    mockRegister.mockResolvedValueOnce(false);
    renderRegister();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register|sign up|create account/i });

    // Fill form with valid data
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('displays loading state during registration', () => {
    mockLoading = true;
    renderRegister();
    
    const submitButton = screen.getByRole('button', { name: /creating account\.\.\./i });
    expect(submitButton).toBeDisabled();
  });

  it('displays error message from AuthContext', () => {
    mockError = 'Registration failed';
    renderRegister();
    
    expect(screen.getByText('Registration failed')).toBeInTheDocument();
  });
}); 