import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, CheckCircle, ShieldAlert, Activity } from 'lucide-react';
import { api } from '../services/api';
import { HealthStatus } from '../types';

export const Home: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.checkHealth()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 bg-gradient-to-b from-blue-50 to-white rounded-3xl border border-blue-100 shadow-sm">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-4">
          Community-Powered City Improvement
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight max-w-3xl mx-auto">
          See a civic issue? <br />
          <span className="text-blue-600">Snap it, map it, and get it fixed.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          CivicLens empowers citizens to report potholes, garbage dumps, broken streetlights, and water leakage directly to city authorities.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow-md hover:bg-blue-700 transition"
          >
            Report an Issue
          </Link>
          <Link
            to="/reports"
            className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition"
          >
            View Live Map
          </Link>
        </div>
      </section>

      {/* Backend & Environment Health Status Card (Stage 1 Verification) */}
      <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-800">System Integration Status</h2>
          </div>
          <span className="text-xs text-gray-400">Stage 1 Foundation Check</span>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500 py-2">Pinging backend at /api/health...</div>
        ) : error ? (
          <div className="flex items-center space-x-2 text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>Backend server is currently starting or offline ({error}). Start the Spring Boot backend on port 8080.</span>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Backend API:</span>
              <span className="inline-flex items-center text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded border border-green-200">
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-600" />
                {health?.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Application:</span>
              <span className="font-mono text-xs text-gray-700">{health?.app}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">PostgreSQL Status:</span>
              <span className="text-gray-700 font-medium">{health?.database}</span>
            </div>
          </div>
        )}
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Photo Verification</h3>
          <p className="mt-2 text-gray-500 text-sm">Upload visual evidence of civic problems with automated geotagging.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Interactive Map</h3>
          <p className="mt-2 text-gray-500 text-sm">Explore issues in your neighborhood with Leaflet OpenStreetMap tiles.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Transparent Progress</h3>
          <p className="mt-2 text-gray-500 text-sm">Track real-time status transitions from submission to verified resolution.</p>
        </div>
      </section>
    </div>
  );
};
