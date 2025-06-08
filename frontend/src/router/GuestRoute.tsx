import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default GuestRoute; 