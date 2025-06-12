import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/AuthContext';
import { CarsPage } from '@/pages/CarsPage';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <span className="text-xl font-bold text-gray-900">AutoStat</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 hidden sm:block">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <CarsPage />
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 