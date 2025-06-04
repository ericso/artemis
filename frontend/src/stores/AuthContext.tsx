import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

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

// Create axios instance with interceptors for debugging
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

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