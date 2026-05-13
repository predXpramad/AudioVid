import { StatusBadge } from './StatusBadge';
import { formatBytes } from '../utils/helpers';
import { XCircle } from 'lucide-react';

export const ProgressCard = ({ job, onCancel }) => {
  // job = { id, filename, size, status, progress: 0-100, message }
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 p-5 relative group">
      {(job.status === 'processing' || job.status === 'queued') && (
        <button 
          onClick={() => onCancel(job.id)}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Cancel Processing"
        >
          <XCircle size={20} />
        </button>
      )}

      <div className="flex justify-between items-start mb-3 pr-8">
        <div>
          <h3 className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[200px] md:max-w-md" title={job.filename}>
            {job.filename}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{formatBytes(job.size)}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-slate-600 dark:text-zinc-300">{job.message || 'Processing...'}</span>
          <span className="font-medium text-slate-700 dark:text-white">{job.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
              job.status === 'failed' ? 'bg-red-500' : 
              job.status === 'success' ? 'bg-green-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${job.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
