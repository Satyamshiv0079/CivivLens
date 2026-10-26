import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ReportStatistics } from '../services/api';
import { CivicReport, IssueCategory, ReportStatus, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatCategory, getCategoryIcon } from '../components/ReportCard';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  X,
  MapPin,
  TrendingUp,
} from 'lucide-react';

interface AdminDashboardProps {
  user: User | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<ReportStatistics | null>(null);
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | ''>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status Update Modal
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>('VERIFIED');
  const [statusComment, setStatusComment] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const isModerator = user && (user.role === 'MODERATOR' || user.role === 'ADMIN');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, reportsData] = await Promise.all([
        api.getReportStatistics(),
        api.getReports({
          status: statusFilter,
          category: categoryFilter,
        }),
      ]);
      setStats(statsData);
      setReports(reportsData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch moderator dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModerator) {
      loadData();
    }
  }, [isModerator, statusFilter, categoryFilter]);

  const openStatusModal = (report: CivicReport, initialStatus: ReportStatus) => {
    setSelectedReport(report);
    setNewStatus(initialStatus);
    setStatusComment('');
    setUpdateError(null);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    if (newStatus === 'REJECTED' && !statusComment.trim()) {
      setUpdateError('A reason comment is required when rejecting a civic report.');
      return;
    }

    setUpdating(true);
    setUpdateError(null);

    try {
      await api.updateReportStatus(selectedReport.id, {
        status: newStatus,
        comment: statusComment.trim() || undefined,
      });

      setSelectedReport(null);
      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUpdateError(err.message);
      } else {
        setUpdateError('Failed to update status.');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (!user || !isModerator) {
    return (
      <div className="max-w-md mx-auto my-16 bg-card p-8 rounded-2xl border border-surfaceBorder text-center shadow-subtle">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-navy">Moderator Access Required</h2>
        <p className="text-sm text-slate-text mt-2">
          This portal is reserved for municipal staff and verified system administrators.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-block px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-subtle transition"
        >
          Sign In with Staff Account
        </Link>
      </div>
    );
  }

  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.authorName.toLowerCase().includes(q) ||
      (r.address && r.address.toLowerCase().includes(q)) ||
      r.id.toString() === q
    );
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-card p-6 sm:p-8 rounded-2xl border border-surfaceBorder shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-primary/10 rounded-xl text-primary">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-navy">Municipal Operations Portal</h1>
          </div>
          <p className="text-sm text-slate-text mt-1">
            Review incoming citizen reports, verify legitimacy, dispatch maintenance crews, and close resolved issues.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-navy rounded-xl text-xs font-bold flex items-center space-x-2 transition border border-surfaceBorder"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate Statistics Calculated from Actual Data */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-card p-4 rounded-2xl border border-surfaceBorder shadow-subtle">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</div>
            <div className="text-2xl font-black text-navy mt-1">{stats.totalReports}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span>All submissions</span>
            </div>
          </div>

          <div className="bg-card p-4 rounded-2xl border border-amber-200/80 shadow-subtle bg-amber-50/20">
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Submitted</span>
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">{stats.submittedReports}</div>
            <div className="text-[11px] text-amber-600 mt-0.5">Awaiting review</div>
          </div>

          <div className="bg-card p-4 rounded-2xl border border-blue-200/80 shadow-subtle bg-blue-50/20">
            <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
            <div className="text-2xl font-black text-blue-700 mt-1">{stats.verifiedReports}</div>
            <div className="text-[11px] text-blue-600 mt-0.5">Validated issues</div>
          </div>

          <div className="bg-card p-4 rounded-2xl border border-purple-200/80 shadow-subtle bg-purple-50/20">
            <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </div>
            <div className="text-2xl font-black text-purple-700 mt-1">{stats.inProgressReports}</div>
            <div className="text-[11px] text-purple-600 mt-0.5">Crews dispatched</div>
          </div>

          <div className="bg-card p-4 rounded-2xl border border-emerald-200/80 shadow-subtle bg-emerald-50/20">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolved</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.resolvedReports}</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Completed fixes</div>
          </div>

          <div className="bg-card p-4 rounded-2xl border border-rose-200/80 shadow-subtle bg-rose-50/20">
            <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
            </div>
            <div className="text-2xl font-black text-rose-700 mt-1">{stats.rejectedReports}</div>
            <div className="text-[11px] text-rose-600 mt-0.5">Invalid or duplicate</div>
          </div>
        </div>
      )}

      {/* Review Queue and Management Table */}
      <div className="bg-card rounded-2xl border border-surfaceBorder shadow-subtle overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-navy">Issue Management Queue</h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-text rounded-full">
              {filteredReports.length} {filteredReports.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, title, citizen..."
                className="pl-8 pr-3 py-1.5 border border-surfaceBorder rounded-xl text-xs text-navy w-full sm:w-48 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '')}
              className="px-3 py-1.5 border border-surfaceBorder rounded-xl text-xs bg-card text-navy focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted (New)</option>
              <option value="VERIFIED">Verified</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | '')}
              className="px-3 py-1.5 border border-surfaceBorder rounded-xl text-xs bg-card text-navy focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="">All Categories</option>
              <option value="POTHOLE">Potholes</option>
              <option value="GARBAGE">Garbage</option>
              <option value="BROKEN_STREETLIGHT">Streetlights</option>
              <option value="WATER_LEAKAGE">Water Leakage</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left text-xs text-slate-text">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-y border-surfaceBorder tracking-wider">
              <tr>
                <th className="py-3 px-6">ID & Photo</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Citizen & Location</th>
                <th className="py-3 px-6 text-right">Moderator Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                    <span>Loading report queue...</span>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>No reports found matching criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-bold text-navy">#{report.id}</span>
                        {report.imageUrl ? (
                          <img
                            src={report.imageUrl}
                            alt=""
                            className="w-10 h-10 object-cover rounded-xl border border-surfaceBorder shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            {getCategoryIcon(report.category)}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <Link
                        to={`/reports/${report.id}`}
                        className="font-bold text-navy hover:text-primary transition line-clamp-1"
                      >
                        {report.title}
                      </Link>
                      <p className="text-[11px] text-slate-text line-clamp-1 mt-0.5">
                        {report.description}
                      </p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-medium text-navy">
                        {getCategoryIcon(report.category)}
                        <span>{formatCategory(report.category)}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-navy">{report.authorName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[160px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{report.address || `${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)}`}</span>
                      </div>
                    </td>

                    <td className="py-3 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/reports/${report.id}`}
                          title="View Full Details"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-text rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Status Transition Shortcut Buttons */}
                        {report.status === 'SUBMITTED' && (
                          <button
                            type="button"
                            onClick={() => openStatusModal(report, 'VERIFIED')}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[11px] border border-blue-200 transition"
                          >
                            Verify
                          </button>
                        )}

                        {(report.status === 'SUBMITTED' || report.status === 'VERIFIED') && (
                          <button
                            type="button"
                            onClick={() => openStatusModal(report, 'IN_PROGRESS')}
                            className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-bold text-[11px] border border-purple-200 transition"
                          >
                            Dispatch
                          </button>
                        )}

                        {report.status === 'IN_PROGRESS' && (
                          <button
                            type="button"
                            onClick={() => openStatusModal(report, 'RESOLVED')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px] border border-emerald-200 transition"
                          >
                            Resolve
                          </button>
                        )}

                        {report.status !== 'REJECTED' && report.status !== 'RESOLVED' && (
                          <button
                            type="button"
                            onClick={() => openStatusModal(report, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px] border border-rose-200 transition"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderator Status Update Dialog */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-surfaceBorder animate-fadeIn">
            <div className="flex justify-between items-center border-b border-surfaceBorder pb-3">
              <div>
                <h3 className="font-bold text-navy text-lg">Update Report Status</h3>
                <p className="text-xs text-slate-text">Report #{selectedReport.id}: {selectedReport.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-navy p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Transition Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 border border-surfaceBorder rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary font-bold text-navy"
                >
                  <option value="SUBMITTED">SUBMITTED (Pending review)</option>
                  <option value="VERIFIED">VERIFIED (Valid civic issue)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Crew dispatched)</option>
                  <option value="RESOLVED">RESOLVED (Issue addressed & closed)</option>
                  <option value="REJECTED">REJECTED (Invalid / Duplicate / Spurious)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Status Remark {newStatus === 'REJECTED' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  rows={3}
                  required={newStatus === 'REJECTED'}
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder={
                    newStatus === 'REJECTED'
                      ? 'Please specify why this report is rejected (e.g. Duplicate report #14, private property)...'
                      : 'Add remarks for the status audit trail (e.g. Repaired street cabling, asphalt poured)...'
                  }
                  className="w-full px-3 py-2 border border-surfaceBorder rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surfaceBorder">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 border border-surfaceBorder rounded-xl text-xs font-bold text-slate-text hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-subtle transition disabled:opacity-50"
                >
                  {updating ? 'Saving Status...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
