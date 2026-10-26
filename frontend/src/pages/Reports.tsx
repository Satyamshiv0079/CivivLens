import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ReportFilterParams } from '../services/api';
import { CivicReport, IssueCategory, ReportStatus } from '../types';
import { ReportCard } from '../components/ReportCard';
import { MapView } from '../components/MapView';
import {
  MapPin,
  LayoutGrid,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  X,
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplets,
  Layers,
} from 'lucide-react';

const CATEGORIES: { label: string; value: IssueCategory | ''; icon: React.ReactNode }[] = [
  { label: 'All Issues', value: '', icon: <Layers className="w-3.5 h-3.5" /> },
  { label: 'Potholes', value: 'POTHOLE', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { label: 'Garbage', value: 'GARBAGE', icon: <Trash2 className="w-3.5 h-3.5" /> },
  { label: 'Streetlights', value: 'BROKEN_STREETLIGHT', icon: <Lightbulb className="w-3.5 h-3.5" /> },
  { label: 'Water Leakage', value: 'WATER_LEAKAGE', icon: <Droplets className="w-3.5 h-3.5" /> },
  { label: 'Other', value: 'OTHER', icon: <AlertCircle className="w-3.5 h-3.5" /> },
];

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

  const hasActiveFilters = category !== '' || status !== '' || searchQuery.trim() !== '';

  const clearAllFilters = () => {
    setCategory('');
    setStatus('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-card p-6 sm:p-8 rounded-2xl border border-surfaceBorder shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Public Directory</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mt-1">Civic Issue Reports</h1>
          <p className="text-sm text-slate-text mt-1 max-w-xl">
            Browse, filter, and track community-reported infrastructure concerns across your neighborhood.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-surfaceBorder">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-card text-primary shadow-subtle font-bold'
                  : 'text-slate-text hover:text-navy'
              }`}
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'map'
                  ? 'bg-card text-primary shadow-subtle font-bold'
                  : 'text-slate-text hover:text-navy'
              }`}
              aria-label="Map View"
            >
              <MapPin className="w-4 h-4" />
              <span>Map</span>
            </button>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Issue</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 sm:p-5 rounded-2xl border border-surfaceBorder shadow-subtle space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, street name, or issue details..."
              className="w-full pl-10 pr-9 py-2 border border-surfaceBorder rounded-xl text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReportStatus | '')}
              className="w-full px-3 py-2 border border-surfaceBorder rounded-xl text-sm bg-card text-navy focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted (New)</option>
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
              className="p-2 border border-surfaceBorder rounded-xl text-slate-text hover:text-primary hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-surfaceBorder">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                  isSelected
                    ? 'bg-primary text-white shadow-subtle'
                    : 'bg-slate-50 border border-surfaceBorder text-slate-text hover:bg-slate-100 hover:text-navy'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active filters status summary */}
      <div className="flex items-center justify-between text-xs text-slate-text px-1">
        <span>
          Showing <strong className="text-navy">{filteredReports.length}</strong> {filteredReports.length === 1 ? 'issue' : 'issues'}
          {category && <> in <strong className="text-navy">{category.toLowerCase().replace('_', ' ')}</strong></>}
          {status && <> with status <strong className="text-navy">{status.toLowerCase().replace('_', ' ')}</strong></>}
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear all filters</span>
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content: Map or Grid */}
      {loading ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-surfaceBorder shadow-subtle">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-navy">Loading civic reports...</p>
          <p className="text-xs text-slate-text mt-1">Retrieving latest records from database</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-surfaceBorder shadow-subtle p-8 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-navy text-lg">No reports match your filters</h3>
          <p className="text-xs text-slate-text mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing status filters, or select a different category.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-xl text-xs font-semibold transition shadow-sm"
              >
                Reset Filters
              </button>
            )}
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold transition shadow-sm"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-2">
          <MapView
            reports={filteredReports}
            center={
              filteredReports[0]
                ? [filteredReports[0].latitude, filteredReports[0].longitude]
                : [12.9716, 77.5946]
            }
            zoom={12}
            height="560px"
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
