import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Reports } from './pages/Reports';
import { ReportDetails } from './pages/ReportDetails';
import { AdminDashboard } from './pages/AdminDashboard';
import { api } from './services/api';
import { User } from './types';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => api.getSavedUser());

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.getMe()
        .then((fetchedUser) => {
          const mapped: User = {
            id: fetchedUser.id,
            name: fetchedUser.name,
            email: fetchedUser.email,
            role: fetchedUser.role,
          };
          setUser(mapped);
          api.saveUser(mapped);
        })
        .catch(() => {
          // Token expired or invalid
          api.removeToken();
          api.clearUser();
          setUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    api.removeToken();
    api.clearUser();
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<ReportDetails currentUser={user} />} />
            <Route
              path="/login"
              element={
                user ? (
                  user.role === 'MODERATOR' || user.role === 'ADMIN' ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                ) : (
                  <Login onLoginSuccess={setUser} />
                )
              }
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/dashboard" replace /> : <Register onRegisterSuccess={setUser} />}
            />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route path="/moderator" element={<Navigate to="/admin" replace />} />
            <Route
              path="*"
              element={
                <div className="text-center py-16">
                  <h2 className="text-2xl font-bold text-gray-800">Page Not Found</h2>
                  <p className="text-gray-500 mt-2">The page you requested does not exist.</p>
                </div>
              }
            />
          </Routes>
        </main>
        <footer className="bg-card border-t border-surfaceBorder py-8 mt-12 text-sm text-slate-text">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
              <span className="font-bold text-navy">CivicLens</span>
              <span className="hidden sm:inline text-slate-300">&bull;</span>
              <p className="text-xs text-slate-400">
                Transparent civic issue reporting and municipal accountability.
              </p>
            </div>
            <div className="flex items-center space-x-6 text-xs font-medium">
              <Link to="/reports" className="hover:text-primary transition">
                Explore Reports
              </Link>
              <Link to="/register" className="hover:text-primary transition">
                Report Issue
              </Link>
              <Link to="/login" className="hover:text-primary transition">
                Sign In
              </Link>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} CivicLens. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
