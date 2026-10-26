import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.login({ email, password });
      api.setToken(response.token);
      api.saveUser(response.user);
      onLoginSuccess(response.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your CivicLens account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@civiclens.gov"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <span>Signing In...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Test Demo Credentials */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center mb-2 font-medium">Quick Demo Accounts:</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('citizen@civiclens.gov', 'Citizen123!')}
            className="flex-1 py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 flex items-center justify-center space-x-1"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Citizen Demo</span>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('moderator@civiclens.gov', 'Moderator123!')}
            className="flex-1 py-1.5 px-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs text-gray-700 flex items-center justify-center space-x-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Moderator Demo</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-blue-600 font-medium hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
};
