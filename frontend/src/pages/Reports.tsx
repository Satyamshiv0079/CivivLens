import React, { useEffect, useState } from 'react';
import { api, ReportFilterParams } from '../services/api';
import { CivicReport, IssueCategory, ReportStatus } from '../types';
import { ReportCard } from '../components/ReportCard';
import { MapView } from '../components/MapView';
import { MapPin, LayoutGrid, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ReportFilterParams = {};
      if (category) params.category = category;
      if (status) params.status = status;

      const data = await api.getReports(params);
      setReports(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch reports. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [category, status]);

  // Client-side text search over title, description, and address
  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.address && r.address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Civic Issue Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse, filter, and track public issues reported across the city
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Grid View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              viewMode === 'map'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords or street name..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as IssueCategory | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="POTHOLE">Pothole</option>
            <option value="GARBAGE">Garbage Dump</option>
            <option value="BROKEN_STREETLIGHT">Broken Streetlight</option>
            <option value="WATER_LEAKAGE">Water Leakage</option>
            <option value="OTHER">Other Issues</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReportStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="VERIFIED">Verified</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Refresh */}
        <div className="sm:col-span-1 flex justify-end">
          <button
            type="button"
            onClick={fetchReports}
            title="Refresh reports"
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content: Map or Grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading civic reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Filter className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-700 text-base">No reports match your filters</h3>
          <p className="text-xs text-gray-400 mt-1">Try clearing the search or changing status/category filters</p>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-500 px-1">
            Displaying {filteredReports.length} issues on map
          </div>
          <MapView
            reports={filteredReports}
            center={
              filteredReports[0]
                ? [filteredReports[0].latitude, filteredReports[0].longitude]
                : [12.9716, 77.5946]
            }
            zoom={12}
            height="550px"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};
