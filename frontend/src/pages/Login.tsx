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
    <div className="max-w-md mx-auto my-10 bg-card p-8 rounded-2xl shadow-subtle border border-surfaceBorder">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-navy">Welcome Back</h1>
        <p className="text-sm text-slate-text mt-1">Sign in to your CivicLens account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@civiclens.gov"
              className="w-full pl-10 pr-3 py-2.5 border border-surfaceBorder rounded-xl text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2.5 border border-surfaceBorder rounded-xl text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-subtle transition flex items-center justify-center space-x-2 disabled:opacity-50"
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
      <div className="mt-6 pt-4 border-t border-surfaceBorder">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
          Local Development Accounts
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('citizen@civiclens.gov', 'Citizen123!')}
            className="flex-1 py-2 px-2 bg-slate-50 hover:bg-slate-100 border border-surfaceBorder rounded-xl text-xs font-semibold text-navy flex items-center justify-center space-x-1.5 transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-primary" />
            <span>Citizen Demo</span>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('moderator@civiclens.gov', 'Moderator123!')}
            className="flex-1 py-2 px-2 bg-slate-50 hover:bg-slate-100 border border-surfaceBorder rounded-xl text-xs font-semibold text-navy flex items-center justify-center space-x-1.5 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Moderator Demo</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-text">
        Don&apos;t have an account yet?{' '}
        <Link to="/register" className="text-primary font-bold hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
};
