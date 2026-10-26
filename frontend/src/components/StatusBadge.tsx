import React from 'react';
import { ReportStatus } from '../types';
import { Clock, CheckCircle2, AlertCircle, PlayCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm font-semibold';

  switch (status) {
    case 'SUBMITTED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}
        >
          <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>Submitted</span>
        </span>
      );
    case 'VERIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>Verified</span>
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}
        >
          <PlayCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>In Progress</span>
        </span>
      );
    case 'RESOLVED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
        >
          <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>Resolved</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
        >
          <XCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>Rejected</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200 ${sizeClasses}`}
        >
          <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>{status}</span>
        </span>
      );
  }
};
