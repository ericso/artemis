import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '@/lib/axios';

interface User {
  id: string;
  email: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  error: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setAuthData = useCallback((data: AuthResponse) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }, []);

  const clearAuthData = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post<AuthResponse>('/auth/register', { email, password });
      setAuthData(response.data);
      return true;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string }; status?: number } };
      console.error('Registration error:', error);
      if (error.response?.status === 404) {
        setError('Registration endpoint not found. Please check the API server.');
      } else {
        setError(error.response?.data?.message || 'Registration failed. Please try again.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuthData]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      setAuthData(response.data);
      return true;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string }; status?: number } };
      console.error('Login error:', error);
      if (error.response?.status === 404) {
        setError('Login endpoint not found. Please check the API server.');
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuthData]);

  const logout = useCallback(() => {
    clearAuthData();
  }, [clearAuthData]);

  return (
    <AuthContext.Provider value={{ token, user, error, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 