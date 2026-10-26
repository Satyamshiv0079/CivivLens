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

  useEffect(() => {
    api.getReports()
      .then((data) => {
        setRecentReports(data.slice(0, 3));
      })
      .catch(() => {
        // Graceful fallback without breaking page presentation
        setRecentReports([]);
      });
  }, []);

  const sampleFeaturedReport: CivicReport | null = recentReports.length > 0 ? recentReports[0] : null;

  return (
    <div className="space-y-20 pb-12">
      {/* 4.B: Hero Section */}
      <section className="pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headlines & Call to Action */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light text-primary rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>Civic Technology for Better Cities</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-navy tracking-tight leading-tight">
                See a civic issue?
              </h1>
              <p className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                Snap it, map it, and track it.
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-text leading-relaxed max-w-xl">
              Help improve your neighborhood by reporting potholes, garbage, broken streetlights,
              and water leakage. Share the location, document the problem, and follow its progress.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link
                to="/register"
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-subtle hover:shadow-card transition flex items-center space-x-2"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/reports"
                className="px-6 py-3 bg-card hover:bg-slate-50 text-navy text-sm font-semibold rounded-xl border border-surfaceBorder shadow-subtle transition flex items-center space-x-2"
              >
                <Search className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <span>Explore Reports</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Live Map Preview or Genuine Report Visual */}
          <div className="lg:col-span-6">
            <div className="bg-card rounded-2xl border border-surfaceBorder p-3 shadow-card space-y-3">
              <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500">
                <span className="font-semibold text-navy flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>City Infrastructure Map Preview</span>
                </span>
                <Link to="/reports" className="text-primary hover:underline text-xs font-medium">
                  Open Interactive Map &rarr;
                </Link>
              </div>

              <div className="rounded-xl overflow-hidden border border-surfaceBorder">
                <MapView
                  reports={recentReports}
                  height="340px"
                  zoom={12}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-2 pb-1">
                <span>{recentReports.length > 0 ? `${recentReports.length} recent issue(s) loaded` : 'No active reports yet'}</span>
                <span>OpenStreetMap &bull; Leaflet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.C: How It Works Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
            How CivicLens Works
          </h2>
          <p className="text-sm text-slate-text">
            Three straightforward steps to bring transparency and resolution to neighborhood concerns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-card p-6 rounded-2xl border border-surfaceBorder shadow-subtle hover:border-slate-300 transition space-y-4">
            <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <span>Report an Issue</span>
              </h3>
              <p className="text-sm text-slate-text leading-relaxed">
                Describe the problem, attach a photo as evidence, select the appropriate category, and submit the details.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-card p-6 rounded-2xl border border-surfaceBorder shadow-subtle hover:border-slate-300 transition space-y-4">
            <div className="w-12 h-12 bg-tealAccent-light text-tealAccent rounded-xl flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-tealAccent" />
                <span>Locate the Problem</span>
              </h3>
              <p className="text-sm text-slate-text leading-relaxed">
                Pinpoint the exact location on the interactive map so municipal crews and neighbors can find it without confusion.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-card p-6 rounded-2xl border border-surfaceBorder shadow-subtle hover:border-slate-300 transition space-y-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Track Progress</span>
              </h3>
              <p className="text-sm text-slate-text leading-relaxed">
                Follow updates as city moderators verify the report, dispatch repair crews, and document the resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.D: Product Preview Section */}
      <section className="bg-slate-100/70 p-6 sm:p-10 rounded-3xl border border-surfaceBorder space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
            Real Transparency in Action
          </h2>
          <p className="text-sm text-slate-text">
            Explore authentic reports and understand how civic issues move through verification.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Representative Report Card */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Representative Issue Card
            </h3>
            {sampleFeaturedReport ? (
              <ReportCard report={sampleFeaturedReport} />
            ) : (
              <div className="bg-card p-8 rounded-2xl border border-surfaceBorder text-center space-y-3 shadow-subtle">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-navy text-sm">No community reports submitted yet</h4>
                <p className="text-xs text-slate-400">
                  Be the first citizen in your neighborhood to submit an issue report.
                </p>
                <Link
                  to="/register"
                  className="inline-block px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg shadow-subtle hover:bg-primary-hover"
                >
                  Create First Report
                </Link>
              </div>
            )}
          </div>

          {/* Status Progression Workflow */}
          <div className="lg:col-span-7 bg-card p-6 rounded-2xl border border-surfaceBorder shadow-subtle space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Report Status Lifecycle
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <StatusBadge status="SUBMITTED" size="sm" />
                  <span className="text-[11px] font-mono text-amber-700">Stage 1</span>
                </div>
                <p className="text-xs text-slate-text">
                  The issue has been documented by a citizen and queued for initial administrative assessment.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200/80 bg-blue-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <StatusBadge status="VERIFIED" size="sm" />
                  <span className="text-[11px] font-mono text-blue-700">Stage 2</span>
                </div>
                <p className="text-xs text-slate-text">
                  A municipal moderator reviewed the report, validated coordinates, and marked it ready for assignment.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-200/80 bg-indigo-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <StatusBadge status="IN_PROGRESS" size="sm" />
                  <span className="text-[11px] font-mono text-indigo-700">Stage 3</span>
                </div>
                <p className="text-xs text-slate-text">
                  Maintenance teams or municipal contractors have been dispatched to the site to execute repairs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <StatusBadge status="RESOLVED" size="sm" />
                  <span className="text-[11px] font-mono text-emerald-700">Stage 4</span>
                </div>
                <p className="text-xs text-slate-text">
                  Repairs have been completed and verified. The report record remains visible for public reference.
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-400 border-t border-surfaceBorder pt-3 flex items-center justify-between">
              <span>Invalid submissions may be rejected with an explicit moderator rationale.</span>
              <StatusBadge status="REJECTED" size="sm" />
            </div>
          </div>
        </div>
      </section>

      {/* 4.E: Benefits Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
            Why CivicLens?
          </h2>
          <p className="text-sm text-slate-text">
            Factual civic accountability designed for communities and municipal staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-2xl border border-surfaceBorder shadow-subtle space-y-3">
            <div className="p-2.5 bg-primary-light text-primary rounded-xl w-fit">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy text-base">Better Documentation</h3>
            <p className="text-sm text-slate-text leading-relaxed">
              Replace lost phone calls and informal complaints with structured records featuring photos, timestamps, and precise geographic coordinates.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-surfaceBorder shadow-subtle space-y-3">
            <div className="p-2.5 bg-tealAccent-light text-tealAccent rounded-xl w-fit">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy text-base">Easier Discovery</h3>
            <p className="text-sm text-slate-text leading-relaxed">
              Explore public issues plotted across your ward or neighborhood before submitting duplicate tickets for the same pothole or leak.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-surfaceBorder shadow-subtle space-y-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl w-fit">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy text-base">Transparent Visibility</h3>
            <p className="text-sm text-slate-text leading-relaxed">
              View the real audit timeline of every issue from submission through field inspection, contractor dispatch, and final signoff.
            </p>
          </div>
        </div>
      </section>

      {/* 4.F: Final Call to Action Section */}
      <section className="bg-primary text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-card">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Your neighborhood deserves better.
          </h2>
          <p className="text-primary-light text-base sm:text-lg">
            Help make local issues visible. Start with one report.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3.5 bg-white text-primary hover:bg-slate-50 font-bold text-sm rounded-xl shadow-subtle transition"
          >
            Report an Issue
          </Link>
          <Link
            to="/reports"
            className="px-6 py-3.5 bg-primary-dark hover:bg-blue-900 text-white font-semibold text-sm rounded-xl transition border border-blue-400/40"
          >
            Explore Reports
          </Link>
        </div>
      </section>
    </div>
  );
};
