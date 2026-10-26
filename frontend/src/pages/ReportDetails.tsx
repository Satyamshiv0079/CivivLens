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
  CheckCircle,
  RefreshCw,
  MessageSquare,
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
  const [newStatus, setNewStatus] = useState<ReportStatus>('IN_PROGRESS');
  const [statusComment, setStatusComment] = useState<string>('');
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

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
    setStatusLoading(true);
    setStatusSuccess(null);

    try {
      const updated = await api.updateReportStatus(report.id, {
        status: newStatus,
        comment: statusComment,
      });
      setReport(updated);
      setStatusComment('');
      setStatusSuccess(`Status successfully transitioned to ${newStatus}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-500">Loading issue details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-red-200 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Report Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">{error || 'This report may have been withdrawn or does not exist.'}</p>
        <Link
          to="/reports"
          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports</span>
        </Link>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === report.authorId;
  const isEditable = isOwner && report.status === 'SUBMITTED';
  const isModerator = currentUser && (currentUser.role === 'MODERATOR' || currentUser.role === 'ADMIN');

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {isEditable && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Report</span>
            </button>
            <button
              type="button"
              onClick={handleWithdraw}
              className="px-3 py-1.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photo & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {report.imageUrl ? (
              <div className="h-80 sm:h-96 bg-black flex items-center justify-center">
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                <div className="p-4 bg-gray-200 rounded-full mb-2">
                  {getCategoryIcon(report.category)}
                </div>
                <span className="text-sm font-medium">No photo provided for this report</span>
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-800 uppercase tracking-wide">
                  {getCategoryIcon(report.category)}
                  <span>{formatCategory(report.category)}</span>
                </span>
                <StatusBadge status={report.status} size="md" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {report.title}
              </h1>

              <div className="pt-2 text-gray-700 text-base leading-relaxed whitespace-pre-line border-t border-gray-100">
                {report.description}
              </div>

              <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span>Reported by: <strong className="text-gray-700">{report.authorName}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Submitted on: {new Date(report.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">Reported Location</h2>
            </div>
            {report.address && (
              <p className="text-sm text-gray-600">{report.address}</p>
            )}
            <div className="text-xs font-mono text-gray-400">
              Coordinates: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
            </div>
            <MapView
              reports={[report]}
              center={[report.latitude, report.longitude]}
              zoom={15}
              height="260px"
            />
          </div>
        </div>

        {/* Right Column: Status History Timeline & Moderator Panel */}
        <div className="space-y-6">
          {/* Moderator Action Panel */}
          {isModerator && (
            <div className="bg-purple-50 border border-purple-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-purple-900">
                <h3 className="font-bold text-base">Moderator Review</h3>
              </div>
              <p className="text-xs text-purple-700">
                Update issue status and record notes visible in the public status audit trail.
              </p>

              {statusSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{statusSuccess}</span>
                </div>
              )}

              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase mb-1">
                    Transition Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg text-xs bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase mb-1">
                    Moderator Note / Reason
                  </label>
                  <textarea
                    rows={2}
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder="e.g. Work crew dispatched to site"
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg text-xs bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={statusLoading}
                  className="w-full py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {statusLoading ? 'Updating Status...' : 'Apply Status Change'}
                </button>
              </form>
            </div>
          )}

          {/* Chronological Status History Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b pb-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <h3 className="font-bold text-gray-900 text-base">Status Progress History</h3>
            </div>

            {report.statusHistory && report.statusHistory.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {report.statusHistory.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* Circle marker */}
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      {item.comment && (
                        <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-start space-x-1.5 mt-1">
                          <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{item.comment}</span>
                        </p>
                      )}
                      <div className="text-[11px] text-gray-400">
                        by <span className="font-medium text-gray-600">{item.updatedBy}</span> &bull;{' '}
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No history records logged.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal for Citizen Owner */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Edit Report Details</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as IssueCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="POTHOLE">Pothole</option>
                  <option value="GARBAGE">Garbage Dump</option>
                  <option value="BROKEN_STREETLIGHT">Broken Streetlight</option>
                  <option value="WATER_LEAKAGE">Water Leakage</option>
                  <option value="OTHER">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
