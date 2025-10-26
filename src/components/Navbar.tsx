import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { getCurrentUser, logout, isAdmin } from '../utils/auth';
export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const isActive = (path: string) => location.pathname === path;
  return <nav className="w-full bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-white">Study Planner</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/schedule')} className={`px-4 py-2 rounded-lg transition-colors ${isActive('/schedule') ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              Schedule
            </button>
            <button onClick={() => navigate('/book')} className={`px-4 py-2 rounded-lg transition-colors ${isActive('/book') ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              Book
            </button>
            {user && isAdmin(user) && <button onClick={() => navigate('/admin')} className={`px-4 py-2 rounded-lg transition-colors ${isActive('/admin') ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                Admin
              </button>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 font-medium">{user?.trNumber}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>;
}