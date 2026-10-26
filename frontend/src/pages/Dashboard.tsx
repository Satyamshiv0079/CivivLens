import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, AiCategorizationResult, DuplicateCandidate } from '../services/api';
import { CivicReport, IssueCategory, User } from '../types';
import { ReportCard, formatCategory } from '../components/ReportCard';
import { MapView } from '../components/MapView';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  RefreshCw,
  X,
  FileText,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface DashboardProps {
  user: User | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [myReports, setMyReports] = useState<CivicReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Report Modal / Form State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<IssueCategory>('POTHOLE');
  const [address, setAddress] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // AI-Assisted State
  const [aiSuggestion, setAiSuggestion] = useState<AiCategorizationResult | null>(null);
  const [duplicateCandidates, setDuplicateCandidates] = useState<DuplicateCandidate[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState<boolean>(false);

  const fetchMyReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReports({ myOnly: true });
      setMyReports(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load your reports.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyReports();
    }
  }, [user]);

  // AI Categorization trigger (debounced on title/description change)
  useEffect(() => {
    if (!showCreateModal) return;
    if (title.trim().length < 4 && description.trim().length < 8) {
      setAiSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const result = await api.aiCategorize({ title, description });
        if (result.suggestedCategory !== 'OTHER' && result.confidence >= 0.65) {
          setAiSuggestion(result);
        } else {
          setAiSuggestion(null);
        }
      } catch {
        // Silent catch for background AI helper
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, description, showCreateModal]);

  // AI Duplicate Detection trigger
  useEffect(() => {
    if (!showCreateModal) return;
    if (!title.trim() || !category) {
      setDuplicateCandidates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingDuplicates(true);
      try {
        const dupes = await api.checkDuplicates({
          latitude: location.lat,
          longitude: location.lng,
          category,
          title,
          description,
        });
        setDuplicateCandidates(dupes);
      } catch {
        // Silent catch
      } finally {
        setCheckingDuplicates(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [location, category, title, description, showCreateModal]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleApplyAiCategory = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.suggestedCategory);
      setAiSuggestion(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      const reportData = {
        title: title.trim(),
        description: description.trim(),
        category,
        latitude: location.lat,
        longitude: location.lng,
        address: address.trim() || undefined,
      };

      formData.append(
        'data',
        new Blob([JSON.stringify(reportData)], { type: 'application/json' })
      );

      if (selectedPhoto) {
        formData.append('photo', selectedPhoto);
      }

      await api.createReport(formData);

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('POTHOLE');
      setAddress('');
      setSelectedPhoto(null);
      setPhotoPreview(null);
      setAiSuggestion(null);
      setDuplicateCandidates([]);
      setShowCreateModal(false);

      // Refresh reports list
      await fetchMyReports();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to submit report. Please check your inputs.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawReport = async (reportId: number) => {
    const confirmWithdraw = window.confirm('Are you sure you want to withdraw this issue?');
    if (!confirmWithdraw) return;

    try {
      await api.deleteReport(reportId);
      await fetchMyReports();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to withdraw report.');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Sign In Required</h2>
        <p className="text-sm text-gray-500 mt-2">
          Please log in to submit civic issues and track their progress.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Dashboard Metrics
  const submittedCount = myReports.filter((r) => r.status === 'SUBMITTED').length;
  const inProgressCount = myReports.filter(
    (r) => r.status === 'IN_PROGRESS' || r.status === 'VERIFIED'
  ).length;
  const resolvedCount = myReports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
              {user.role}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Report issues in your neighborhood, track municipal progress, and view resolution updates.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center space-x-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report an Issue</span>
          </button>
          <Link
            to="/reports"
            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold flex items-center space-x-1.5 transition"
          >
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>Explore Map</span>
          </Link>
        </div>
      </div>

      {/* Citizen Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Reported
            </span>
            <div className="text-3xl font-extrabold text-gray-900 mt-1">{myReports.length}</div>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Under Review
            </span>
            <div className="text-3xl font-extrabold text-purple-700 mt-1">
              {submittedCount + inProgressCount}
            </div>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Resolved Issues
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* My Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900">My Issue Reports</h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {myReports.length}
            </span>
          </div>
          <button
            type="button"
            onClick={fetchMyReports}
            className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading your reports...</p>
          </div>
        ) : myReports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
            <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-700 text-base">No issues reported yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Notice a pothole, broken streetlight, or garbage in your area? Report it now and help
              keep the city clean and safe.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Report Your First Issue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                currentUserId={user.id}
                onWithdraw={handleWithdrawReport}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal: Submit New Issue Form */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-xl">Report a Civic Issue</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Provide issue details, upload a photo, and pick the location on the map
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* AI Duplicate Detection Warning Banner */}
            {duplicateCandidates.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Potential Duplicate Issue Detected Nearby</span>
                </div>
                <p className="text-xs text-amber-700">
                  A similar report was already submitted within {duplicateCandidates[0].distanceMeters}m of this location:
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-800">#{duplicateCandidates[0].id}: {duplicateCandidates[0].title}</span>
                    <div className="text-[11px] text-gray-500">
                      Status: {duplicateCandidates[0].status} &bull; {duplicateCandidates[0].distanceMeters} meters away
                    </div>
                  </div>
                  <Link
                    to={`/reports/${duplicateCandidates[0].id}`}
                    target="_blank"
                    className="text-blue-600 hover:underline font-semibold text-xs ml-2 flex-shrink-0"
                  >
                    View Existing &rarr;
                  </Link>
                </div>
                <p className="text-[11px] text-amber-600 italic">
                  You may still proceed if this is a distinct problem.
                </p>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep pothole causing traffic obstruction"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* AI Auto-Categorization Chip */}
              {aiSuggestion && aiSuggestion.suggestedCategory !== category && (
                <div className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-pulse flex-shrink-0" />
                    <span>
                      AI suggests category: <strong>{formatCategory(aiSuggestion.suggestedCategory)}</strong> (
                      {Math.round(aiSuggestion.confidence * 100)}% match)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyAiCategory}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    Apply Suggestion
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IssueCategory)}
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
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Street Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Near 4th Main metro station"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the severity, exact location details, and any safety hazards..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Interactive Location Picker */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    Map Location (Click map to position pin) *
                  </label>
                  <span className="text-[11px] font-mono text-gray-400">
                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                    {checkingDuplicates && <span className="ml-2 text-blue-500 animate-pulse">Checking area...</span>}
                  </span>
                </div>
                <MapView
                  interactivePicker={true}
                  selectedLocation={location}
                  onLocationSelect={(coords) => setLocation(coords)}
                  center={[location.lat, location.lng]}
                  zoom={14}
                  height="220px"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Photo Evidence (Optional, max 10MB)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting Report...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
