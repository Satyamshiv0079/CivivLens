import React from 'react';
import { ReportStatus } from '../types';
import { Clock, CheckCircle2, PlayCircle, XCircle, ShieldCheck, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-xs'
      : size === 'md'
      ? 'px-3 py-1 text-xs font-semibold'
      : 'px-3.5 py-1.5 text-sm font-semibold';

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  switch (status) {
    case 'SUBMITTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses}`}
        >
          <Clock className={`${iconSize} text-amber-600 flex-shrink-0`} aria-hidden="true" />
          <span>Submitted</span>
        </span>
      );
    case 'VERIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-800 border border-blue-200/80 ${sizeClasses}`}
        >
          <ShieldCheck className={`${iconSize} text-blue-600 flex-shrink-0`} aria-hidden="true" />
          <span>Verified</span>
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 ${sizeClasses}`}
        >
          <PlayCircle className={`${iconSize} text-indigo-600 flex-shrink-0`} aria-hidden="true" />
          <span>In Progress</span>
        </span>
      );
    case 'RESOLVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClasses}`}
        >
          <CheckCircle2 className={`${iconSize} text-emerald-600 flex-shrink-0`} aria-hidden="true" />
          <span>Resolved</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-200/80 ${sizeClasses}`}
        >
          <XCircle className={`${iconSize} text-rose-600 flex-shrink-0`} aria-hidden="true" />
          <span>Rejected</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          <HelpCircle className={`${iconSize} text-slate-500 flex-shrink-0`} aria-hidden="true" />
          <span>{status}</span>
        </span>
      );
  }
};
