import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Camera,
  MapPin,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isModerator = user && (user.role === 'MODERATOR' || user.role === 'ADMIN');
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-card border-b border-surfaceBorder sticky top-0 z-40 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Brand Icon & Wordmark */}
          <Link
            to="/"
            className="flex items-center space-x-2.5 group rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="CivicLens Homepage"
          >
            <span className="p-2 bg-primary-light text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition duration-200">
              <Camera className="w-5 h-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-navy">
              Civic<span className="text-primary">Lens</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6" aria-label="Main Navigation">
            <Link
              to="/reports"
              className={`text-sm font-medium transition flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${
                isActive('/reports')
                  ? 'text-primary bg-primary-light font-semibold'
                  : 'text-slate-text hover:text-navy hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Explore Reports</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                {isModerator ? (
                  <Link
                    to="/admin"
                    className={`text-sm font-semibold flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition ${
                      isActive('/admin')
                        ? 'bg-purple-100 text-purple-800'
                        : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Moderator Portal</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className={`text-sm font-medium flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition ${
                      isActive('/dashboard')
                        ? 'text-primary bg-primary-light font-semibold'
                        : 'text-slate-text hover:text-navy hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* User Pill */}
                <div className="flex items-center space-x-2 pl-3 border-l border-surfaceBorder">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isModerator ? 'bg-purple-100 text-purple-700' : 'bg-primary-light text-primary'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <div className="font-semibold text-navy max-w-[120px] truncate">{user.name}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {user.role}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign Out"
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-text hover:text-navy hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surfaceBorder bg-card px-4 pt-3 pb-4 space-y-2 shadow-lg">
          <Link
            to="/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-navy hover:bg-slate-50"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span>Explore Reports</span>
          </Link>

          {user ? (
            <>
              {isModerator ? (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-purple-800 bg-purple-50"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Moderator Portal</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-navy hover:bg-slate-50"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <span>Dashboard</span>
                </Link>
              )}

              <div className="pt-2 border-t border-surfaceBorder flex items-center justify-between px-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-navy">{user.name}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">{user.role}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-surfaceBorder flex flex-col space-y-2">
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl shadow-sm transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 rounded-xl transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
