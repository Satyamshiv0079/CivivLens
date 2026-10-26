import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, User as UserIcon, AlertTriangle, Trash2, Zap, Droplet, HelpCircle } from 'lucide-react';
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
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'GARBAGE':
      return <Trash2 className="w-4 h-4 text-emerald-500" />;
    case 'BROKEN_STREETLIGHT':
      return <Zap className="w-4 h-4 text-yellow-500" />;
    case 'WATER_LEAKAGE':
      return <Droplet className="w-4 h-4 text-blue-500" />;
    default:
      return <HelpCircle className="w-4 h-4 text-gray-500" />;
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
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
      {/* Thumbnail or Icon Banner */}
      <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {report.imageUrl ? (
          <img
            src={report.imageUrl}
            alt={report.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <div className="p-3 bg-gray-200 rounded-full mb-1">
              {getCategoryIcon(report.category)}
            </div>
            <span className="text-xs uppercase font-medium tracking-wider text-gray-500">
              {formatCategory(report.category)}
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-gray-800 shadow-sm border border-gray-100">
            {getCategoryIcon(report.category)}
            <span>{formatCategory(report.category)}</span>
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/reports/${report.id}`} className="group">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-lg line-clamp-1">
              {report.title}
            </h3>
          </Link>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {report.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <UserIcon className="w-3.5 h-3.5 text-gray-400" />
              <span>{report.authorName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
        <Link
          to={`/reports/${report.id}`}
          className="text-blue-600 font-semibold hover:underline"
        >
          View Details &rarr;
        </Link>

        {isEditable && (
          <div className="flex items-center space-x-3">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(report)}
                className="text-gray-600 hover:text-blue-600 font-medium transition"
              >
                Edit
              </button>
            )}
            {onWithdraw && (
              <button
                type="button"
                onClick={() => onWithdraw(report.id)}
                className="text-gray-600 hover:text-red-600 font-medium transition"
              >
                Withdraw
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
