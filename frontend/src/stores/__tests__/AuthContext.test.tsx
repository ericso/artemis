import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Silence the expected console error for the error test
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock axios post function
const mockPost = vi.hoisted(() => vi.fn());

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    },
    post: mockPost
  };
  return {
    default: mockAxios,
    __esModule: true
  };
});

// Mock storage
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  })
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('AuthContext', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    mockConsoleError.mockClear();
    localStorage.clear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('useAuth Hook', () => {
    it('throws error when used outside AuthProvider', () => {
      // Suppress the expected error log
      mockConsoleError.mockImplementationOnce(() => {});
      
      // Render without a provider
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      // Verify the error was logged
      expect(mockConsoleError).toHaveBeenCalled();
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
        const mockResponse = {
          data: {
            token: 'fake-token',
            user: {
              id: '1',
              email: 'test@example.com'
            }
          }
        };
        mockPost.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useAuth(), {
          wrapper: AuthProvider
        });

        await act(async () => {
          await result.current.login('test@example.com', 'password');
        });

        expect(mockPost).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password'
        });
        expect(result.current.user).toEqual(mockResponse.data.user);
        expect(localStorage.getItem('token')).toBe('fake-token');
      });

      it('handles login error', async () => {
        const mockError = { response: { data: { message: 'Invalid credentials' } } };
        mockPost.mockRejectedValueOnce(mockError as Record<string, unknown>);

        const { result } = renderHook(() => useAuth(), {
          wrapper: AuthProvider
        });

        await act(async () => {
          await result.current.login('test@example.com', 'password');
        });

        expect(result.current.error).toBe('Invalid credentials');
      });
    });

    describe('register', () => {
      it('successfully registers user', async () => {
        const mockResponse = {
          data: {
            token: 'fake-token',
            user: {
              id: '1',
              email: 'test@example.com'
            }
          }
        };
        mockPost.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useAuth(), {
          wrapper: AuthProvider
        });

        await act(async () => {
          await result.current.register('test@example.com', 'password');
        });

        expect(mockPost).toHaveBeenCalledWith('/auth/register', {
          email: 'test@example.com',
          password: 'password'
        });
        expect(result.current.user).toEqual(mockResponse.data.user);
        expect(localStorage.getItem('token')).toBe('fake-token');
      });

      it('handles registration error', async () => {
        const mockError = { response: { data: { message: 'Email already exists' } } };
        mockPost.mockRejectedValueOnce(mockError as Record<string, unknown>);

        const { result } = renderHook(() => useAuth(), {
          wrapper: AuthProvider
        });

        await act(async () => {
          await result.current.register('test@example.com', 'password');
        });

        expect(result.current.error).toBe('Email already exists');
      });
    });

    describe('logout', () => {
      it('clears user data and token', async () => {
        // First login
        const mockResponse = {
          data: {
            token: 'fake-token',
            user: {
              id: '1',
              email: 'test@example.com'
            }
          }
        };
        mockPost.mockResolvedValueOnce(mockResponse);

        const { result } = renderHook(() => useAuth(), {
          wrapper: AuthProvider
        });

        await act(async () => {
          await result.current.login('test@example.com', 'password');
        });

        // Then logout
        act(() => {
          result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
      });
    });

    describe('loading state', () => {
      it('sets loading state during login', async () => {
        const mockResponse = {
          data: {
            token: 'fake-token',
            user: {
              id: '1',
              email: 'test@example.com'
            }
          }
        };
        mockPost.mockImplementationOnce(
          () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
        );

        const { result } = renderHook(() => useAuth(), {
          wrapper: AuthProvider
        });

        let loginPromise: Promise<boolean>;
        act(() => {
          loginPromise = result.current.login('test@example.com', 'password');
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
          await loginPromise;
        });

        expect(result.current.loading).toBe(false);
      });
    });
  });
}); 