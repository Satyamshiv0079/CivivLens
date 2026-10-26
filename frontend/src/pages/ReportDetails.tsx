import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { CivicReport, User, IssueCategory, ReportStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { MapView } from '../components/MapView';
import { formatCategory, getCategoryIcon } from '../components/ReportCard';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User as UserIcon,
  Edit3,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';

interface ReportDetailsProps {
  currentUser: User | null;
}

export const ReportDetails: React.FC<ReportDetailsProps> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<CivicReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCategory, setEditCategory] = useState<IssueCategory>('POTHOLE');
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Moderator Status Update State
  const [newStatus, setNewStatus] = useState<ReportStatus>('VERIFIED');
  const [statusComment, setStatusComment] = useState<string>('');
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchReport = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReportById(Number(id));
      setReport(data);
      setEditTitle(data.title);
      setEditDescription(data.description);
      setEditCategory(data.category);

      // Pre-select sensible default next status based on current status
      if (data.status === 'SUBMITTED') setNewStatus('VERIFIED');
      else if (data.status === 'VERIFIED') setNewStatus('IN_PROGRESS');
      else if (data.status === 'IN_PROGRESS') setNewStatus('RESOLVED');
      else setNewStatus('RESOLVED');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load report details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    setEditLoading(true);
    setEditError(null);

    try {
      const updated = await api.updateReport(report.id, {
        title: editTitle,
        description: editDescription,
        category: editCategory,
      });
      setReport(updated);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditError(err.message);
      } else {
        setEditError('Failed to update report.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!report) return;
    const confirmDelete = window.confirm(
      'Are you sure you want to withdraw this issue report? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      await api.deleteReport(report.id);
      navigate('/dashboard');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to withdraw report.');
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    if (newStatus === 'REJECTED' && !statusComment.trim()) {
      setStatusError('A reason comment is required when rejecting a report.');
      return;
    }

    setStatusLoading(true);
    setStatusSuccess(null);
    setStatusError(null);

    try {
      const updated = await api.updateReportStatus(report.id, {
        status: newStatus,
        comment: statusComment.trim() || undefined,
      });
      setReport(updated);
      setStatusComment('');
      setStatusSuccess(`Status successfully transitioned to ${newStatus.replace('_', ' ')}`);
    } catch (err: unknown) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 bg-card rounded-2xl border border-surfaceBorder shadow-subtle max-w-xl mx-auto my-12">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-navy">Loading report details...</p>
        <p className="text-xs text-slate-text mt-1">Fetching information from municipal registry</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-card rounded-2xl border border-rose-200 text-center shadow-subtle">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-navy">Report Not Found</h2>
        <p className="text-sm text-slate-text mt-2">{error || 'This report may have been withdrawn or does not exist.'}</p>
        <Link
          to="/reports"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition shadow-subtle"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === report.authorId;
  const isEditable = isOwner && report.status === 'SUBMITTED';
  const isModerator = currentUser && (currentUser.role === 'MODERATOR' || currentUser.role === 'ADMIN');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <nav className="flex items-center space-x-2 text-xs text-slate-text" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/reports" className="hover:text-primary transition">Reports</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-navy truncate max-w-xs">Report #{report.id}</span>
        </nav>

        <div className="flex items-center space-x-2">
          {isEditable && (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-sm transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Edit Details</span>
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-subtle transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Withdraw</span>
              </button>
            </>
          )}

          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-text hover:text-navy font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Reports</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Photo & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-surfaceBorder overflow-hidden shadow-subtle">
            {report.imageUrl ? (
              <div className="h-80 sm:h-96 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="h-56 bg-slate-50 flex flex-col items-center justify-center text-slate-400 border-b border-surfaceBorder">
                <div className="p-4 bg-slate-100 rounded-2xl mb-2 text-slate-500">
                  {getCategoryIcon(report.category)}
                </div>
                <span className="text-xs font-semibold text-slate-500">No photographic evidence attached</span>
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-xl text-xs font-bold text-navy uppercase tracking-wide">
                  {getCategoryIcon(report.category)}
                  <span>{formatCategory(report.category)}</span>
                </span>
                <StatusBadge status={report.status} size="md" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight leading-snug">
                {report.title}
              </h1>

              <div className="pt-2 text-slate-text text-base leading-relaxed whitespace-pre-line border-t border-surfaceBorder">
                {report.description}
              </div>

              <div className="pt-4 border-t border-surfaceBorder grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-text">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Reported by: <strong className="text-navy">{report.authorName}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Submitted: {new Date(report.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map Card */}
          <div className="bg-card p-6 rounded-2xl border border-surfaceBorder shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-navy">Reported Location</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
              </span>
            </div>

            {report.address && (
              <p className="text-sm font-medium text-slate-text bg-slate-50 p-2.5 rounded-xl border border-surfaceBorder">
                {report.address}
              </p>
            )}

            <MapView
              reports={[report]}
              center={[report.latitude, report.longitude]}
              zoom={15}
              height="280px"
            />
          </div>
        </div>

        {/* Right Column: Moderator Panel & Status History Timeline */}
        <div className="space-y-6">
          {/* Moderator Action Panel */}
          {isModerator && (
            <div className="bg-card border-2 border-primary/20 p-6 rounded-2xl shadow-subtle space-y-4">
              <div className="flex items-center space-x-2 text-navy">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base">Moderator Actions</h3>
              </div>
              <p className="text-xs text-slate-text">
                Review this civic issue, update progress status, and leave remarks for the public audit trail.
              </p>

              {statusSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusSuccess}</span>
                </div>
              )}

              {statusError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{statusError}</span>
                </div>
              )}

              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                    Transition Next Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                    className="w-full px-3 py-2 border border-surfaceBorder rounded-xl text-xs bg-card text-navy focus:outline-none focus:ring-2 focus:ring-primary font-bold"
                  >
                    <option value="SUBMITTED">SUBMITTED (Pending review)</option>
                    <option value="VERIFIED">VERIFIED (Valid civic issue)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Crew assigned)</option>
                    <option value="RESOLVED">RESOLVED (Issue addressed)</option>
                    <option value="REJECTED">REJECTED (Invalid / Duplicate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                    Moderator Note {newStatus === 'REJECTED' ? '(Required)' : '(Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={statusComment}
                    required={newStatus === 'REJECTED'}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder={
                      newStatus === 'REJECTED'
                        ? 'State reason for rejection...'
                        : 'e.g., Road repair unit assigned for site visit'
                    }
                    className="w-full px-3 py-2 border border-surfaceBorder rounded-xl text-xs bg-card text-navy focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={statusLoading}
                  className="w-full py-2.5 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusLoading ? 'Updating Status...' : 'Apply Status Change'}
                </button>
              </form>
            </div>
          )}

          {/* Chronological Status History Timeline */}
          <div className="bg-card p-6 rounded-2xl border border-surfaceBorder shadow-subtle space-y-4">
            <div className="flex items-center space-x-2 border-b border-surfaceBorder pb-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-navy text-base">Progress History</h3>
            </div>

            {report.statusHistory && report.statusHistory.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surfaceBorder">
                {report.statusHistory.map((item, index) => {
                  const isLatest = index === (report.statusHistory?.length ?? 1) - 1;
                  return (
                    <div key={item.id} className="relative">
                      {/* Circle marker */}
                      <div
                        className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-subtle ${
                          isLatest ? 'bg-primary ring-2 ring-primary/20' : 'bg-slate-400'
                        }`}
                      />

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <StatusBadge status={item.status} size="sm" />
                          {isLatest && (
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                              Current
                            </span>
                          )}
                        </div>

                        {item.comment && (
                          <div className="text-xs text-navy bg-slate-50 p-2.5 rounded-xl border border-surfaceBorder flex items-start space-x-2 mt-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                            <span>{item.comment}</span>
                          </div>
                        )}

                        <div className="text-[11px] text-slate-400 pt-0.5">
                          by <strong className="text-slate-text">{item.updatedBy}</strong> &bull;{' '}
                          {new Date(item.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No history records logged.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal for Citizen Owner */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-surfaceBorder animate-fadeIn">
            <div className="flex justify-between items-center border-b border-surfaceBorder pb-3">
              <div>
                <h3 className="font-bold text-navy text-lg">Edit Report Details</h3>
                <p className="text-xs text-slate-text">Update the information before verification</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-navy p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-surfaceBorder rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as IssueCategory)}
                  className="w-full px-3 py-2 border border-surfaceBorder rounded-xl text-sm bg-card text-navy focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                >
                  <option value="POTHOLE">Pothole</option>
                  <option value="GARBAGE">Garbage Dump</option>
                  <option value="BROKEN_STREETLIGHT">Broken Streetlight</option>
                  <option value="WATER_LEAKAGE">Water Leakage</option>
                  <option value="OTHER">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-surfaceBorder rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surfaceBorder">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
