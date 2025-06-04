import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { render, screen, act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import axios, { AxiosInstance } from 'axios';

// Silence the expected console error for the error test
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

const mockPost = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    create: () => ({
      post: mockPost,
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      },
      defaults: {},
      baseURL: 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}));

describe('AuthContext', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com'
  };

  const mockAuthResponse = {
    token: 'fake-token',
    user: mockUser,
    message: 'Success'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    consoleSpy.mockClear();
    localStorage.clear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('useAuth Hook', () => {
    it('throws error when used outside AuthProvider', () => {
      // Suppress the expected error log
      consoleSpy.mockImplementationOnce(() => {});
      
      // Render without a provider
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      // Verify the error was logged
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('AuthProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    it('provides initial state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('loads persisted auth state from localStorage', () => {
      localStorage.setItem('token', 'persisted-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current.token).toBe('persisted-token');
      expect(result.current.user).toEqual(mockUser);
    });

    describe('login', () => {
      it('successfully logs in user', async () => {
        mockPost.mockResolvedValueOnce({ data: mockAuthResponse });
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        let success;
        await act(async () => {
          success = await result.current.login('test@example.com', 'password123');
        });

        expect(mockPost).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
        expect(success).toBe(true);
        expect(result.current.token).toBe(mockAuthResponse.token);
        expect(result.current.user).toEqual(mockAuthResponse.user);
        expect(result.current.error).toBeNull();
        expect(localStorage.getItem('token')).toBe(mockAuthResponse.token);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockAuthResponse.user));
      });

      it('handles login failure with error message', async () => {
        const errorMessage = 'Invalid credentials';
        mockPost.mockRejectedValueOnce({
          response: {
            data: { message: errorMessage },
            status: 401
          }
        });

        const { result } = renderHook(() => useAuth(), { wrapper });
        
        let success;
        await act(async () => {
          success = await result.current.login('test@example.com', 'wrongpassword');
        });

        expect(success).toBe(false);
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.token).toBeNull();
        expect(result.current.user).toBeNull();
      });

      it('handles 404 error for login endpoint', async () => {
        mockPost.mockRejectedValueOnce({
          response: {
            status: 404
          }
        });

        const { result } = renderHook(() => useAuth(), { wrapper });
        
        let success;
        await act(async () => {
          success = await result.current.login('test@example.com', 'password123');
        });

        expect(success).toBe(false);
        expect(result.current.error).toBe('Login endpoint not found. Please check the API server.');
      });
    });

    describe('register', () => {
      it('successfully registers user', async () => {
        mockPost.mockResolvedValueOnce({ data: mockAuthResponse });
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        let success;
        await act(async () => {
          success = await result.current.register('test@example.com', 'password123');
        });

        expect(mockPost).toHaveBeenCalledWith('/auth/register', {
          email: 'test@example.com',
          password: 'password123'
        });
        expect(success).toBe(true);
        expect(result.current.token).toBe(mockAuthResponse.token);
        expect(result.current.user).toEqual(mockAuthResponse.user);
        expect(result.current.error).toBeNull();
        expect(localStorage.getItem('token')).toBe(mockAuthResponse.token);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockAuthResponse.user));
      });

      it('handles registration failure with error message', async () => {
        const errorMessage = 'Email already exists';
        mockPost.mockRejectedValueOnce({
          response: {
            data: { message: errorMessage },
            status: 400
          }
        });

        const { result } = renderHook(() => useAuth(), { wrapper });
        
        let success;
        await act(async () => {
          success = await result.current.register('existing@example.com', 'password123');
        });

        expect(success).toBe(false);
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.token).toBeNull();
        expect(result.current.user).toBeNull();
      });

      it('handles 404 error for register endpoint', async () => {
        mockPost.mockRejectedValueOnce({
          response: {
            status: 404
          }
        });

        const { result } = renderHook(() => useAuth(), { wrapper });
        
        let success;
        await act(async () => {
          success = await result.current.register('test@example.com', 'password123');
        });

        expect(success).toBe(false);
        expect(result.current.error).toBe('Registration endpoint not found. Please check the API server.');
      });
    });

    describe('logout', () => {
      it('clears auth state and localStorage', async () => {
        localStorage.setItem('token', 'test-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        expect(result.current.token).toBe('test-token');
        expect(result.current.user).toEqual(mockUser);
        
        act(() => {
          result.current.logout();
        });
        
        expect(result.current.token).toBeNull();
        expect(result.current.user).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      });
    });

    describe('loading state', () => {
      it('sets loading state during login', async () => {
        let resolvePromise!: (value: any) => void;
        mockPost.mockImplementationOnce(() => 
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
        );
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        // Start the login process
        const loginPromise = result.current.login('test@example.com', 'password123');
        
        // Wait for loading to be true
        await waitFor(() => {
          expect(result.current.loading).toBe(true);
        });
        
        // Resolve the login
        resolvePromise({ data: mockAuthResponse });
        await loginPromise;
        
        // Wait for loading to be false
        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });
      });

      it('sets loading state during registration', async () => {
        let resolvePromise!: (value: any) => void;
        mockPost.mockImplementationOnce(() => 
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
        );
        
        const { result } = renderHook(() => useAuth(), { wrapper });
        
        // Start the registration process
        const registerPromise = result.current.register('test@example.com', 'password123');
        
        // Wait for loading to be true
        await waitFor(() => {
          expect(result.current.loading).toBe(true);
        });
        
        // Resolve the registration
        resolvePromise({ data: mockAuthResponse });
        await registerPromise;
        
        // Wait for loading to be false
        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });
      });
    });
  });
}); 