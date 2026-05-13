import { cn } from '../utils/helpers';
import { CheckCircle2, Clock, XCircle, AlertCircle, PlayCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const config = {
    queued: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock, label: 'Queued' },
    processing: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: PlayCircle, label: 'Processing' },
    success: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, label: 'Completed' },
    failed: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Failed' },
    error: { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle, label: 'Error' },
  };

  const current = config[status] || config.queued;
  const Icon = current.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", current.color)}>
      <Icon size={14} />
      {current.label}
    </span>
  );
};
