import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, MapPin, LayoutDashboard, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isModerator = user && (user.role === 'MODERATOR' || user.role === 'ADMIN');

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
            <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Camera className="w-5 h-5" />
            </span>
            <span className="tracking-tight text-gray-900">
              Civic<span className="text-blue-600">Lens</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/reports"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
            >
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>Explore Reports</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                {isModerator ? (
                  <Link
                    to="/admin"
                    className="text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Moderator Portal</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isModerator
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-gray-800 leading-tight">
                      {user.name}
                    </div>
                    <div
                      className={`text-[10px] uppercase font-bold tracking-wider ${
                        isModerator ? 'text-purple-600' : 'text-blue-600'
                      }`}
                    >
                      {user.role}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
