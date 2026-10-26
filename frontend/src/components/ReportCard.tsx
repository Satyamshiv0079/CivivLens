import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  User as UserIcon,
  AlertTriangle,
  Trash2,
  Zap,
  Droplet,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { CivicReport, IssueCategory } from '../types';
import { StatusBadge } from './StatusBadge';

interface ReportCardProps {
  report: CivicReport;
  currentUserId?: number;
  onEdit?: (report: CivicReport) => void;
  onWithdraw?: (reportId: number) => void;
}

export const getCategoryIcon = (category: IssueCategory) => {
  switch (category) {
    case 'POTHOLE':
      return <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />;
    case 'GARBAGE':
      return <Trash2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />;
    case 'BROKEN_STREETLIGHT':
      return <Zap className="w-4 h-4 text-yellow-600" aria-hidden="true" />;
    case 'WATER_LEAKAGE':
      return <Droplet className="w-4 h-4 text-sky-600" aria-hidden="true" />;
    default:
      return <HelpCircle className="w-4 h-4 text-slate-500" aria-hidden="true" />;
  }
};

export const formatCategory = (category: IssueCategory) => {
  return category.replace(/_/g, ' ');
};

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  currentUserId,
  onEdit,
  onWithdraw,
}) => {
  const isOwner = currentUserId && report.authorId === currentUserId;
  const isEditable = isOwner && report.status === 'SUBMITTED';

  const formattedDate = new Date(report.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="bg-card rounded-xl border border-surfaceBorder overflow-hidden shadow-subtle hover:shadow-card hover:border-slate-300 transition duration-150 flex flex-col justify-between">
      {/* Media or Visual Header */}
      <div className="relative h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
        {report.imageUrl ? (
          <img
            src={report.imageUrl}
            alt={`Photo of ${report.title}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4">
            <div className="p-3 bg-white rounded-full shadow-subtle mb-2">
              {getCategoryIcon(report.category)}
            </div>
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-500">
              {formatCategory(report.category)}
            </span>
          </div>
        )}

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-semibold text-navy shadow-subtle border border-surfaceBorder">
            {getCategoryIcon(report.category)}
            <span>{formatCategory(report.category)}</span>
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/reports/${report.id}`}
            className="group block rounded focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <h3 className="font-bold text-navy group-hover:text-primary transition text-base line-clamp-1">
              {report.title}
            </h3>
          </Link>
          <p className="mt-2 text-sm text-slate-text line-clamp-2 leading-relaxed">
            {report.description}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="mt-4 pt-3 border-t border-surfaceBorder space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">
              {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1 truncate max-w-[50%]">
              <UserIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{report.authorName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <time dateTime={report.createdAt}>{formattedDate}</time>
            </div>
          </div>
        </div>
      </div>

      {/* Action Strip */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-surfaceBorder flex items-center justify-between text-xs">
        <Link
          to={`/reports/${report.id}`}
          className="text-primary font-semibold hover:text-primary-hover flex items-center gap-1 group rounded focus-visible:ring-1 focus-visible:ring-primary"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" aria-hidden="true" />
        </Link>

        {isEditable && (
          <div className="flex items-center space-x-3">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(report)}
                className="text-slate-600 hover:text-primary font-medium transition"
              >
                Edit
              </button>
            )}
            {onWithdraw && (
              <button
                type="button"
                onClick={() => onWithdraw(report.id)}
                className="text-slate-600 hover:text-rose-600 font-medium transition"
              >
                Withdraw
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
