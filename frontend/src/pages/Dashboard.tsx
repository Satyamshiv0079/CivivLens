import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, AiCategorizationResult, DuplicateCandidate } from '../services/api';
import { CivicReport, IssueCategory, User } from '../types';
import { ReportCard, formatCategory, getCategoryIcon } from '../components/ReportCard';
import { MapView } from '../components/MapView';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  RefreshCw,
  X,
  FileText,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Upload,
} from 'lucide-react';

interface DashboardProps {
  user: User | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [myReports, setMyReports] = useState<CivicReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 4-Step Form Wizard State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
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
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // AI Helpers
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

  // AI Categorization trigger
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
        // Background helper fails silently
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
    }, 500);

    return () => clearTimeout(timer);
  }, [location, category, title, description, showCreateModal]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setPhotoError('Image file exceeds the 10MB maximum limit.');
        return;
      }

      // Validate type
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type.toLowerCase())) {
        setPhotoError('Invalid format. Only JPEG, PNG, and WebP images are allowed.');
        return;
      }

      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
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
      setStep(1);
      setShowCreateModal(false);

      // Refresh reports
      await fetchMyReports();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to submit report. Please check your information.');
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
      <div className="text-center py-20 bg-card rounded-2xl border border-surfaceBorder shadow-subtle max-w-md mx-auto p-8 space-y-4">
        <h2 className="text-xl font-bold text-navy">Sign In Required</h2>
        <p className="text-sm text-slate-text">
          Please log in to submit civic issues and track their progress.
        </p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-subtle hover:bg-primary-hover transition"
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
      {/* 8.A: Citizen Dashboard Header */}
      <div className="bg-card p-6 sm:p-8 rounded-2xl border border-surfaceBorder shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy">Welcome, {user.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-primary-light text-primary border border-blue-200">
              {user.role}
            </span>
          </div>
          <p className="text-sm text-slate-text mt-1">
            Report issues in your neighborhood, track municipal progress, and view resolution updates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setStep(1);
            setShowCreateModal(true);
          }}
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-subtle transition flex items-center space-x-2 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report an Issue</span>
        </button>
      </div>

      {/* Summary Counts from Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border border-surfaceBorder shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reports</span>
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-navy mt-2">{myReports.length}</div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-surfaceBorder shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Submitted</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-navy mt-2">{submittedCount}</div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-surfaceBorder shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Work</span>
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-navy mt-2">{inProgressCount}</div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-surfaceBorder shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resolved</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-navy mt-2">{resolvedCount}</div>
        </div>
      </div>

      {/* My Reports List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-navy">My Reported Issues</h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {myReports.length}
            </span>
          </div>
          <button
            type="button"
            onClick={fetchMyReports}
            className="text-xs text-primary font-semibold hover:underline flex items-center space-x-1"
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
          <div className="text-center py-16 bg-card rounded-2xl border border-surfaceBorder">
            <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading your issues...</p>
          </div>
        ) : myReports.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-surfaceBorder p-8 space-y-3">
            <Camera className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-navy text-base">No issues reported yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Notice a pothole, broken streetlight, or garbage in your area? Report it now and help keep our city clean and safe.
            </p>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setShowCreateModal(true);
              }}
              className="mt-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-subtle transition"
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

      {/* 6. Report Submission Flow Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <div className="bg-card rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 space-y-6 border border-surfaceBorder">
            {/* Modal Header & Progress Indicator */}
            <div className="flex justify-between items-start border-b border-surfaceBorder pb-4">
              <div>
                <h2 id="report-modal-title" className="font-bold text-navy text-xl">
                  Report a Civic Issue
                </h2>
                <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-400">
                  <span className={step === 1 ? 'text-primary font-bold' : step > 1 ? 'text-navy font-semibold' : ''}>
                    1. Details
                  </span>
                  <span>&rarr;</span>
                  <span className={step === 2 ? 'text-primary font-bold' : step > 2 ? 'text-navy font-semibold' : ''}>
                    2. Evidence
                  </span>
                  <span>&rarr;</span>
                  <span className={step === 3 ? 'text-primary font-bold' : step > 3 ? 'text-navy font-semibold' : ''}>
                    3. Location
                  </span>
                  <span>&rarr;</span>
                  <span className={step === 4 ? 'text-primary font-bold' : ''}>
                    4. Review
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              {/* STEP 1: Issue Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-navy uppercase mb-1">
                      Issue Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Deep pothole causing vehicular hazard"
                      className="w-full px-3.5 py-2.5 border border-surfaceBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy uppercase mb-1">
                      Detailed Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what is broken, traffic hazards, water flow, or safety concerns..."
                      className="w-full px-3.5 py-2.5 border border-surfaceBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy uppercase mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as IssueCategory)}
                      className="w-full px-3.5 py-2.5 border border-surfaceBorder rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="POTHOLE">Pothole / Road Damage</option>
                      <option value="GARBAGE">Garbage Dump / Waste Accumulation</option>
                      <option value="BROKEN_STREETLIGHT">Broken Streetlight / Dark Spot</option>
                      <option value="WATER_LEAKAGE">Water Leakage / Pipe Burst</option>
                      <option value="OTHER">Other Civic Concern</option>
                    </select>
                  </div>

                  {/* AI Categorization Assist Pill */}
                  {aiSuggestion && aiSuggestion.suggestedCategory !== category && (
                    <div className="p-3 bg-primary-light border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-navy">
                        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 animate-pulse" />
                        <span>
                          AI Recommendation: <strong>{formatCategory(aiSuggestion.suggestedCategory)}</strong> (
                          {Math.round(aiSuggestion.confidence * 100)}% confidence)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyAiCategory}
                        className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={!title.trim() || !description.trim()}
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-subtle flex items-center gap-1.5 transition"
                    >
                      <span>Continue to Evidence</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Photo Evidence */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-navy uppercase">
                      Attach Photographic Evidence
                    </label>
                    <p className="text-xs text-slate-400">
                      Clear photos expedite field verification and maintenance crew dispatch.
                    </p>
                  </div>

                  {photoError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{photoError}</span>
                    </div>
                  )}

                  {photoPreview ? (
                    <div className="relative rounded-xl border border-surfaceBorder overflow-hidden bg-slate-50 p-2">
                      <img
                        src={photoPreview}
                        alt="Issue Evidence Preview"
                        className="w-full h-56 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-4 right-4 p-1.5 bg-card/90 text-red-600 rounded-lg shadow-subtle hover:bg-white text-xs font-semibold flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Remove Photo</span>
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 hover:bg-primary-light/30">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm font-semibold text-navy">Click to browse or drag image here</span>
                      <span className="text-xs text-slate-400 mt-1">JPEG, PNG, or WebP up to 10MB</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border border-surfaceBorder rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-subtle flex items-center gap-1.5 transition"
                    >
                      <span>Continue to Location</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Location Pinning */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-navy uppercase">
                      Pin Issue Location <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-400">
                      Click directly on the map to place the issue marker.
                    </p>
                  </div>

                  <div className="h-64 rounded-xl overflow-hidden border border-surfaceBorder">
                    <MapView
                      selectedLocation={location}
                      onLocationSelect={(coords) => setLocation(coords)}
                      center={[location.lat, location.lng]}
                      zoom={14}
                      height="100%"
                      interactivePicker={true}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Selected Coordinates:</span>
                      <div className="font-mono font-medium text-navy bg-slate-100 px-2.5 py-1.5 rounded-lg mt-1">
                        {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Street / Landmark Address:</span>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Near Crossroad 4, MG Road"
                        className="w-full px-2.5 py-1.5 border border-surfaceBorder rounded-lg mt-1 text-xs focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-surfaceBorder rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-subtle flex items-center gap-1.5 transition"
                    >
                      <span>Review Submission</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review and Submit */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Summary Confirmation
                  </h3>

                  {/* AI Duplicate Detection Warning Banner */}
                  {checkingDuplicates && (
                    <div className="text-xs text-slate-400 italic">
                      Checking for nearby duplicate reports...
                    </div>
                  )}
                  {duplicateCandidates.length > 0 && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Possible Nearby Duplicate Detected</span>
                      </div>
                      <p className="text-amber-700">
                        A similar report (#{duplicateCandidates[0].id}: {duplicateCandidates[0].title}) already exists within {duplicateCandidates[0].distanceMeters}m of this location.
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-xl p-4 border border-surfaceBorder space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-semibold text-navy flex items-center gap-1">
                        {getCategoryIcon(category)}
                        {formatCategory(category)}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400">Title:</span>
                      <span className="font-semibold text-navy text-right max-w-xs">{title}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-mono text-navy text-right">
                        {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                        {address && <div className="text-[11px] font-sans text-slate-500">{address}</div>}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Photo Attached:</span>
                      <span className="font-semibold text-navy">
                        {selectedPhoto ? selectedPhoto.name : 'None provided'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setStep(3)}
                      className="px-4 py-2 border border-surfaceBorder rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-subtle flex items-center gap-2 transition"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Submitting Report...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Report</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
