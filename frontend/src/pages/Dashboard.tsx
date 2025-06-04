import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="user-info">
        <h2>Welcome!</h2>
        <p>Email: {user?.email}</p>
      </div>
    </div>
  );
}

export default Dashboard; 