import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  MapPin,
  Clock,
  ArrowRight,
  FileText,
  Search,
  Eye,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { CivicReport } from '../types';
import { ReportCard } from '../components/ReportCard';
import { MapView } from '../components/MapView';
import { StatusBadge } from '../components/StatusBadge';

export const Home: React.FC = () => {
  const [recentReports, setRecentReports] = useState<CivicReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getReports()
      .then((data) => {
        setRecentReports(data.slice(0, 3));
      })
      .catch(() => {
        setRecentReports([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const sampleFeaturedReport: CivicReport | null = recentReports.length > 0 ? recentReports[0] : null;

  return (
    <div className="space-y-12 sm:space-y-16 pb-4">
      {/* Hero Section */}
      <section className="pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Headlines & Call to Action */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full text-xs font-semibold border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
              <span>Civic Technology for Better Neighborhoods</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                See a civic issue?
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-[#2563EB] tracking-tight">
                Snap it, map it, and track it.
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Help improve your neighborhood by reporting potholes, garbage, broken streetlights,
              and water leakage. Share the location, document the problem, and follow its progress.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/register"
                className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-sm transition flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/reports"
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold text-sm rounded-xl border border-gray-300 shadow-sm transition flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
              >
                <Search className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <span>Explore Reports</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Live Map Preview with Genuine Report Data */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-sm space-y-3">
              <div className="flex items-center justify-between px-2 pt-1 text-xs">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#2563EB]" />
                  <span>Reported Issues Map Preview</span>
                </span>
                <Link to="/reports" className="text-[#2563EB] hover:underline font-semibold flex items-center gap-0.5">
                  <span>Explore all</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-200 relative">
                <MapView
                  reports={recentReports}
                  height="320px"
                  zoom={12}
                />
                {!loading && recentReports.length === 0 && (
                  <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-[500]">
                    <MapPin className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-bold text-gray-800">No civic issues reported yet</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                      When community members submit issues, markers will automatically plot on this map.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 px-2 pb-0.5">
                <span>
                  {recentReports.length > 0
                    ? `Showing ${recentReports.length} recently submitted report(s)`
                    : 'Awaiting first community report'}
                </span>
                <span>OpenStreetMap &bull; Leaflet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-6 sm:space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            How CivicLens Works
          </h2>
          <p className="text-sm text-gray-600">
            Three straightforward steps to document, track, and resolve neighborhood infrastructure issues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center font-bold text-base border border-blue-100">
              1
            </div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#2563EB]" />
              <span>Document the Issue</span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Describe the problem, attach a photo as evidence, select the appropriate category, and submit the report.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center font-bold text-base border border-teal-100">
              2
            </div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Pin the Location</span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Select the exact spot on the interactive map so moderators and neighbors can locate the issue easily.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-base border border-indigo-100">
              3
            </div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Track Progress</span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Follow updates as moderators review the report, verify the problem, update status, and record notes on the public timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="bg-slate-100/70 p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Real Transparency in Action
          </h2>
          <p className="text-sm text-gray-600">
            Explore authentic reports and see how civic issues move through review.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Representative Report Card */}
          <div className="lg:col-span-5 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Recent Issue Report
            </h3>
            {sampleFeaturedReport ? (
              <ReportCard report={sampleFeaturedReport} />
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center space-y-3 shadow-sm">
                <FileText className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="font-bold text-gray-900 text-sm">No community reports submitted yet</h4>
                <p className="text-xs text-gray-500">
                  Be the first citizen to submit a civic report in this system.
                </p>
                <Link
                  to="/register"
                  className="inline-block px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  Create First Report
                </Link>
              </div>
            )}
          </div>

          {/* Status Progression Lifecycle */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Report Status Lifecycle
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <StatusBadge status="SUBMITTED" size="sm" />
                  <span className="text-[11px] font-mono text-amber-700 font-semibold">Stage 1</span>
                </div>
                <p className="text-xs text-gray-600 leading-normal">
                  The issue has been documented by a citizen and queued for moderation review.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200/80 bg-blue-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <StatusBadge status="VERIFIED" size="sm" />
                  <span className="text-[11px] font-mono text-blue-700 font-semibold">Stage 2</span>
                </div>
                <p className="text-xs text-gray-600 leading-normal">
                  A moderator reviewed the submission, verified location details, and confirmed the report.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-200/80 bg-indigo-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <StatusBadge status="IN_PROGRESS" size="sm" />
                  <span className="text-[11px] font-mono text-indigo-700 font-semibold">Stage 3</span>
                </div>
                <p className="text-xs text-gray-600 leading-normal">
                  The issue is marked in progress while corrective action or repairs are underway.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <StatusBadge status="RESOLVED" size="sm" />
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold">Stage 4</span>
                </div>
                <p className="text-xs text-gray-600 leading-normal">
                  The issue has been addressed and closed. The record remains visible for public reference.
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-500 border-t border-gray-100 pt-3 flex items-center justify-between">
              <span>Invalid submissions may be rejected with an explicit moderator comment.</span>
              <StatusBadge status="REJECTED" size="sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="space-y-6 sm:space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Why CivicLens?
          </h2>
          <p className="text-sm text-gray-600">
            Factual civic tracking designed for community members and moderators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
            <div className="p-2.5 bg-blue-50 text-[#2563EB] rounded-xl w-fit border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Better Documentation</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Replace lost calls and informal chats with structured records featuring photos, timestamps, and precise geographic coordinates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl w-fit border border-teal-100">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Clear Spatial Context</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Explore public issues plotted across the city map before submitting duplicate tickets for the same pothole or broken streetlight.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl w-fit border border-indigo-100">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Transparent Tracking</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              View the complete audit history of every issue from citizen submission to moderation review and final resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Closing Call to Action Section (Compact, deliberate layout with accessible contrast) */}
      <section className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-6 sm:p-8 text-center space-y-4">
        <div className="max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Your neighborhood deserves better.
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Help document and resolve local infrastructure concerns. Start with one report.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <Link
            to="/register"
            className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-sm transition flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
          >
            <span>Report an Issue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/reports"
            className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-900 font-semibold text-sm rounded-xl border border-gray-300 shadow-sm transition flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
          >
            <Search className="w-4 h-4 text-gray-500" />
            <span>Explore Reports</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
