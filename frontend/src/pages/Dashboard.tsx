import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import { CarsPage } from './CarsPage';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cars');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Artemis</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('cars')}
                  className={`${
                    activeTab === 'cars'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Cars
                </button>
                {/* Add more navigation items here as needed */}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-white border border-gray-300 rounded-md py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'cars' && <CarsPage />}
      </main>
    </div>
  );
}

export default Dashboard; 