import { createBrowserRouter, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import { useAuth } from '../stores/AuthContext';

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Guest Route wrapper component (for login/register pages)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <GuestRoute><Login /></GuestRoute>
  },
  {
    path: '/register',
    element: <GuestRoute><Register /></GuestRoute>
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  }
]); 